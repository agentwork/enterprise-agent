"use server";

import { db } from "@/lib/db";
import { documents, documentChunks } from "@/lib/db/schema/knowledge";
import {
  createDocumentSchema,
  searchKnowledgeSchema,
  deleteDocumentSchema,
  type CreateDocumentInput,
  type SearchKnowledgeInput,
} from "../types";
import { generateEmbedding, generateEmbeddings, splitText } from "../utils/embeddings";
import { revalidatePath } from "next/cache";
import { eq, sql, desc, cosineDistance } from "drizzle-orm";

export async function createDocument(input: CreateDocumentInput) {
  const result = createDocumentSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.message };
  }

  const { title, content, fileType, metadata } = result.data;

  try {
    // 1. Create Document
    const [doc] = await db
      .insert(documents)
      .values({
        title,
        content,
        fileType,
        metadata,
      })
      .returning();

    if (!doc) throw new Error("Failed to create document record");

    // 2. Split content into chunks
    const chunks = await splitText(content);

    // 3. Generate embeddings
    // We process in batches to avoid rate limits if necessary, but for now simple batch
    const embeddings = await generateEmbeddings(chunks);

    // 4. Insert chunks
    const chunksToInsert = chunks.map((chunkContent, index) => ({
      documentId: doc.id,
      content: chunkContent,
      embedding: embeddings[index],
      chunkIndex: index,
      metadata: { ...metadata, chunkIndex: index },
    }));

    if (chunksToInsert.length > 0) {
      await db.insert(documentChunks).values(chunksToInsert);
    }

    revalidatePath("/knowledge");
    return { success: true, data: doc };
  } catch (error) {
    console.error("Error creating document:", error);
    return { success: false, error: "Failed to process document" };
  }
}

export async function searchKnowledge(input: SearchKnowledgeInput) {
  const result = searchKnowledgeSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.message };
  }

  const { query, limit, threshold } = result.data;

  try {
    const queryEmbedding = await generateEmbedding(query);

    // Perform vector similarity search
    // cosineDistance returns distance (0 = identical, 2 = opposite)
    // We want similarity, so close to 0 is good.
    // Filter by distance < (1 - threshold) roughly, but usually threshold is for similarity (0-1).
    // Let's use distance directly. standard is <-> operator in pgvector.

    const similarity = sql<number>`1 - (${cosineDistance(
      documentChunks.embedding,
      queryEmbedding
    )})`;

    const chunks = await db
      .select({
        id: documentChunks.id,
        content: documentChunks.content,
        similarity,
        documentId: documentChunks.documentId,
        metadata: documentChunks.metadata,
        documentTitle: documents.title,
      })
      .from(documentChunks)
      .leftJoin(documents, eq(documentChunks.documentId, documents.id))
      .where(sql`${cosineDistance(documentChunks.embedding, queryEmbedding)} < ${1 - threshold}`)
      .orderBy(desc(similarity))
      .limit(limit);

    return { success: true, data: chunks };
  } catch (error) {
    console.error("Error searching knowledge:", error);
    return { success: false, error: "Failed to search knowledge base" };
  }
}

export async function getDocuments() {
  try {
    const docs = await db.select().from(documents).orderBy(desc(documents.createdAt));
    return { success: true, data: docs };
  } catch (error) {
    console.error("Error fetching documents:", error);
    return { success: false, error: "Failed to fetch documents" };
  }
}

export async function deleteDocument(id: string) {
  const result = deleteDocumentSchema.safeParse({ id });
  if (!result.success) {
    return { success: false, error: result.error.message };
  }

  try {
    await db.delete(documents).where(eq(documents.id, id));
    revalidatePath("/knowledge");
    return { success: true };
  } catch (error) {
    console.error("Error deleting document:", error);
    return { success: false, error: "Failed to delete document" };
  }
}
