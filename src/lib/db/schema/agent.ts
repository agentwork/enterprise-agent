import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { profiles } from "./auth";

export const threads = pgTable("threads", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id).notNull(),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// LangGraph Checkpoints (for persistence)
export const checkpoints = pgTable("checkpoints", {
  threadId: text("thread_id").primaryKey(), // Using text to match LangGraph ID format if needed
  checkpoint: jsonb("checkpoint").notNull(), // Serialized graph state
  metadata: jsonb("metadata").notNull(),
  parentCheckpointId: text("parent_checkpoint_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  threadId: uuid("thread_id").references(() => threads.id, { onDelete: "cascade" }).notNull(),
  role: text("role").notNull(), // user, assistant, system, tool
  content: text("content").notNull(),
  toolCalls: jsonb("tool_calls"), // Array of tool calls
  toolResults: jsonb("tool_results"), // Array of tool results
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
