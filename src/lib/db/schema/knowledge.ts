import { pgTable, uuid, text, timestamp, jsonb, vector, integer } from "drizzle-orm/pg-core";

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  content: text("content"), // Full text content
  filePath: text("file_path"), // Path in Supabase Storage
  fileType: text("file_type"), // pdf, docx, url
  metadata: jsonb("metadata"), // Author, date, tags
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documentChunks = pgTable("document_chunks", {
  id: uuid("id").defaultRandom().primaryKey(),
  documentId: uuid("document_id").references(() => documents.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(), // The chunk text
  embedding: vector("embedding", { dimensions: 1536 }), // OpenAI ada-002
  chunkIndex: integer("chunk_index").notNull(),
  metadata: jsonb("metadata"),
});
