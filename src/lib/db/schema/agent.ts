import { pgTable, uuid, text, timestamp, jsonb, primaryKey, integer } from "drizzle-orm/pg-core";
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
  threadId: text("thread_id").notNull(),
  checkpointId: text("checkpoint_id").notNull(),
  parentCheckpointId: text("parent_checkpoint_id"),
  checkpoint: jsonb("checkpoint").notNull(), // Serialized graph state
  metadata: jsonb("metadata").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.threadId, table.checkpointId] }),
  };
});

export const checkpointWrites = pgTable("checkpoint_writes", {
  threadId: text("thread_id").notNull(),
  checkpointId: text("checkpoint_id").notNull(),
  taskId: text("task_id").notNull(),
  idx: integer("idx").notNull(),
  channel: text("channel").notNull(),
  type: text("type"),
  value: jsonb("value"),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.threadId, table.checkpointId, table.taskId, table.idx] }),
  };
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
