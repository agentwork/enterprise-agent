import { pgTable, text, timestamp, uuid, decimal, pgEnum } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";
import { join } from "path";

// 載入環境變數
dotenv.config({ path: join(process.cwd(), ".env.local") });

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set");
  process.exit(1);
}

// 內部複製 schema 以避免循環引用
const dealStageEnum = pgEnum("deal_stage", [
  "lead", "qualification", "proposal", "negotiation", "closed_won", "closed_lost",
]);

const activityTypeEnum = pgEnum("activity_type", [
  "note", "call", "meeting", "email", "task",
]);

const clients = pgTable("clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  industry: text("industry"),
  description: text("description"),
  website: text("website"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const deals = pgTable("deals", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }),
  stage: dealStageEnum("stage").default("lead").notNull(),
  probability: decimal("probability", { precision: 5, scale: 2 }),
  expectedCloseDate: timestamp("expected_close_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const activities = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "cascade" }),
  dealId: uuid("deal_id").references(() => deals.id, { onDelete: "set null" }),
  type: activityTypeEnum("type").notNull(),
  content: text("content").notNull(),
  sentiment: text("sentiment"),
  performedAt: timestamp("performed_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const client = postgres(process.env.DATABASE_URL, { prepare: false });
const db = drizzle(client);

async function seed() {
  console.log("🌱 Starting CRM seeding...");

  try {
    console.log("👥 Seeding clients...");
    const insertedClients = await db.insert(clients).values([
      {
        name: "Acme Corporation",
        industry: "Manufacturing",
        website: "https://acme.com",
        description: "Global leader in specialized gadgets and explosive devices.",
      },
      {
        name: "Globex Corporation",
        industry: "High-Tech",
        website: "https://globex.com",
        description: "Innovative tech company focusing on world dominance and energy.",
      },
      {
        name: "Stark Industries",
        industry: "Defense",
        website: "https://stark.com",
        description: "Advanced technology, robotics, and clean energy solutions.",
      },
      {
        name: "Wayne Enterprises",
        industry: "Conglomerate",
        website: "https://wayne.com",
        description: "Diversified multinational with interests in tech, shipping, and defense.",
      },
    ]).returning();

    const [acme, globex, stark, wayne] = insertedClients;

    console.log("💼 Seeding deals...");
    const insertedDeals = await db.insert(deals).values([
      {
        clientId: acme.id,
        title: "Gadget Supply Q3",
        amount: "50000.00",
        stage: "qualification",
        probability: "40",
        expectedCloseDate: new Date("2026-09-30"),
      },
      {
        clientId: acme.id,
        title: "Heavy Machinery Expansion",
        amount: "250000.00",
        stage: "negotiation",
        probability: "75",
        expectedCloseDate: new Date("2026-05-15"),
      },
      {
        clientId: globex.id,
        title: "Cloud Infrastructure Migration",
        amount: "120000.00",
        stage: "proposal",
        probability: "60",
        expectedCloseDate: new Date("2026-07-20"),
      },
      {
        clientId: stark.id,
        title: "Arc Reactor Maintenance Contract",
        amount: "1000000.00",
        stage: "closed_won",
        probability: "100",
        expectedCloseDate: new Date("2026-03-01"),
      },
      {
        clientId: wayne.id,
        title: "Urban Development Project",
        amount: "500000.00",
        stage: "lead",
        probability: "10",
        expectedCloseDate: new Date("2027-01-10"),
      },
    ]).returning();

    const [gadgetDeal, machineDeal, cloudDeal, arcDeal] = insertedDeals;

    console.log("📝 Seeding activities...");
    await db.insert(activities).values([
      {
        clientId: acme.id,
        dealId: gadgetDeal.id,
        type: "call",
        content: "Discussed Q3 supply requirements. Customer is interested in new gadget line.",
        sentiment: "positive",
        performedAt: new Date(),
      },
      {
        clientId: acme.id,
        dealId: machineDeal.id,
        type: "meeting",
        content: "Site visit to Acme HQ. Reviewed space for new machinery.",
        sentiment: "neutral",
        performedAt: new Date(Date.now() - 86400000 * 2),
      },
      {
        clientId: globex.id,
        dealId: cloudDeal.id,
        type: "email",
        content: "Sent updated proposal for cloud migration. Waiting for feedback.",
        sentiment: "neutral",
        performedAt: new Date(Date.now() - 86400000 * 1),
      },
      {
        clientId: stark.id,
        dealId: arcDeal.id,
        type: "note",
        content: "Contract signed and payment received. Project kick-off scheduled.",
        sentiment: "positive",
        performedAt: new Date(),
      },
    ]);

    console.log("✅ CRM Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
