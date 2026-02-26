import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";
import { join } from "path";

dotenv.config({ path: join(process.cwd(), ".env.local") });

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set");
  process.exit(1);
}

const templates = pgTable("templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  structure: jsonb("structure").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client);

async function seed() {
  console.log("🌱 Starting Proposal Templates seeding...");

  try {
    const templateData = [
      {
        name: "Standard Business Proposal",
        description: "A comprehensive proposal template for general business use.",
        structure: [
          {
            id: "executive_summary",
            title: "Executive Summary",
            type: "text",
            prompt: "Write a compelling executive summary for {{client_name}} that outlines the value proposition.",
          },
          {
            id: "problem_statement",
            title: "Problem Statement",
            type: "text",
            prompt: "Describe the challenges faced by {{client_name}} based on recent meetings.",
          },
          {
            id: "proposed_solution",
            title: "Proposed Solution",
            type: "text",
            prompt: "Detail our solution for {{client_name}}, highlighting key features and benefits.",
          },
          {
            id: "pricing",
            title: "Investment",
            type: "table",
            prompt: "Outline the pricing structure for the proposed solution.",
          },
          {
            id: "timeline",
            title: "Timeline",
            type: "text",
            prompt: "Propose a timeline for implementation.",
          },
        ],
      },
      {
        name: "Quick Quote",
        description: "A short proposal focused on pricing and deliverables.",
        structure: [
          {
            id: "introduction",
            title: "Introduction",
            type: "text",
            prompt: "Briefly introduce the quote for {{client_name}}.",
          },
          {
            id: "deliverables",
            title: "Deliverables",
            type: "list",
            prompt: "List the key deliverables.",
          },
          {
            id: "pricing",
            title: "Pricing",
            type: "table",
            prompt: "Provide a clear breakdown of costs.",
          },
        ],
      },
    ];

    await db.insert(templates).values(templateData).returning();
    console.log("✅ Templates seeded successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await client.end();
  }
}

seed();
