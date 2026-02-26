import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

// We need to define the enum in the database first
export const userRoleEnum = pgEnum("user_role", ["admin", "manager", "staff"]);

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // References auth.users.id
  email: text("email").notNull(),
  fullName: text("full_name"),
  role: userRoleEnum("role").default("staff").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
