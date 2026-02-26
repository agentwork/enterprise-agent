import { pgTable, uuid, text, timestamp, decimal } from "drizzle-orm/pg-core";
import { profiles } from "./auth";

export const clients = pgTable("clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  industry: text("industry"),
  website: text("website"),
  status: text("status").default("active"), // active, churned, lead
  ownerId: uuid("owner_id").references(() => profiles.id), // Assigned AM
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contacts = pgTable("contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "cascade" }).notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  position: text("position"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const deals = pgTable("deals", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").references(() => clients.id).notNull(),
  title: text("title").notNull(),
  value: decimal("value", { precision: 12, scale: 2 }).default("0"),
  stage: text("stage").default("new"), // new, negotiation, won, lost
  probability: decimal("probability").default("0"), // 0-100%
  expectedCloseDate: timestamp("expected_close_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activities = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  entityType: text("entity_type").notNull(), // client, deal
  entityId: uuid("entity_id").notNull(),
  type: text("type").notNull(), // call, email, meeting, note
  content: text("content"), // Summary or notes
  performedBy: uuid("performed_by").references(() => profiles.id).notNull(),
  performedAt: timestamp("performed_at").defaultNow().notNull(),
});
