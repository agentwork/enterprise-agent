import { pgTable, text, timestamp, uuid, jsonb, pgEnum, pgPolicy } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { clients } from "./crm";

export const proposalStatusEnum = pgEnum("proposal_status", [
  "draft",
  "review",
  "sent",
  "accepted",
  "rejected",
]);

export const templates = pgTable("templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  structure: jsonb("structure").notNull(), // List of sections
  createdBy: uuid("created_by").default(sql`auth.uid()`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  pgPolicy("Enable read access for authenticated users", {
    as: "permissive",
    for: "select",
    to: "authenticated",
    using: sql`true`,
  }),
  pgPolicy("Enable insert for authenticated users", {
    as: "permissive",
    for: "insert",
    to: "authenticated",
    withCheck: sql`auth.uid() = ${table.createdBy}`,
  }),
  pgPolicy("Enable update for owners", {
    as: "permissive",
    for: "update",
    to: "authenticated",
    using: sql`auth.uid() = ${table.createdBy}`,
  }),
]);

export const proposals = pgTable("proposals", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "cascade" }).notNull(),
  templateId: uuid("template_id").references(() => templates.id).notNull(),
  title: text("title").notNull(),
  status: proposalStatusEnum("status").default("draft").notNull(),
  content: jsonb("content").notNull(), // Generated content
  createdBy: uuid("created_by").default(sql`auth.uid()`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  pgPolicy("Enable read access for own proposals", {
    as: "permissive",
    for: "select",
    to: "authenticated",
    using: sql`auth.uid() = ${table.createdBy}`,
  }),
  pgPolicy("Enable insert for authenticated users", {
    as: "permissive",
    for: "insert",
    to: "authenticated",
    withCheck: sql`auth.uid() = ${table.createdBy}`,
  }),
  pgPolicy("Enable update for own proposals", {
    as: "permissive",
    for: "update",
    to: "authenticated",
    using: sql`auth.uid() = ${table.createdBy}`,
  }),
  pgPolicy("Enable delete for own proposals", {
    as: "permissive",
    for: "delete",
    to: "authenticated",
    using: sql`auth.uid() = ${table.createdBy}`,
  }),
]);

export const proposalsRelations = relations(proposals, ({ one }) => ({
  client: one(clients, {
    fields: [proposals.clientId],
    references: [clients.id],
  }),
  template: one(templates, {
    fields: [proposals.templateId],
    references: [templates.id],
  }),
}));
