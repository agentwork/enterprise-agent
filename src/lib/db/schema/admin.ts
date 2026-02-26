import { pgTable, text, timestamp, boolean, jsonb, uuid } from "drizzle-orm/pg-core";

/**
 * Stores system-wide configuration settings like LLM API keys, model names, etc.
 * Key-value store for flexibility.
 */
export const systemSettings = pgTable("system_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(), // Stores the actual setting value (string, number, object, etc.)
  description: text("description"),
  isEncrypted: boolean("is_encrypted").default(false), // Flag to indicate if the value is encrypted (for API keys)
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Configuration for external MCP servers that the Agent should connect to.
 */
export const mcpServers = pgTable("mcp_servers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(), // Unique identifier for the server (e.g., "supabase", "filesystem")
  command: text("command").notNull(), // The executable command (e.g., "npx", "python")
  args: jsonb("args").$type<string[]>().default([]), // Arguments for the command
  env: jsonb("env").$type<Record<string, string>>().default({}), // Environment variables for the server
  isEnabled: boolean("is_enabled").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
