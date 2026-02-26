import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import { documents, documentChunks } from "@/lib/db/schema/knowledge";

// Base schemas from Drizzle
export const documentSchema = createSelectSchema(documents);
export const documentChunkSchema = createSelectSchema(documentChunks);

export type Document = z.infer<typeof documentSchema>;
export type DocumentChunk = z.infer<typeof documentChunkSchema>;

// Input schemas for actions
export const createDocumentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  fileType: z.enum(["text", "markdown", "pdf"]).default("text"),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type CreateDocumentFormValues = z.input<typeof createDocumentSchema>;

export const searchKnowledgeSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  limit: z.number().min(1).max(20).default(5),
  threshold: z.number().min(0).max(1).default(0.5),
});

export type SearchKnowledgeInput = z.infer<typeof searchKnowledgeSchema>;

export const deleteDocumentSchema = z.object({
  id: z.string().uuid("Invalid document ID"),
});
