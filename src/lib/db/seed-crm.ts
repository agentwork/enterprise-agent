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
    const clientData = [
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
      {
        name: "Cyberdyne Systems",
        industry: "Technology",
        website: "https://cyberdyne.com",
        description: "Leading AI and robotics research corporation.",
      },
      {
        name: "Umbrella Corporation",
        industry: "Pharmaceutical",
        website: "https://umbrella.com",
        description: "Global pharmaceutical and biotechnology giant.",
      },
      {
        name: "InGen",
        industry: "Biotechnology",
        website: "https://ingen.com",
        description: "Specializing in genetic engineering and research.",
      },
      {
        name: "Oscorp",
        industry: "Chemicals",
        website: "https://oscorp.com",
        description: "Leading manufacturer of chemicals and medical technology.",
      },
      {
        name: "Tyrell Corporation",
        industry: "Robotics",
        website: "https://tyrell.com",
        description: "Advanced robotics and synthetic human development.",
      },
      {
        name: "Weyland-Yutani",
        industry: "Aerospace",
        website: "https://weyland.com",
        description: "Building better worlds through space exploration and mining.",
      }
    ];

    const insertedClients = await db.insert(clients).values(clientData).returning();

    console.log("💼 Seeding deals...");
    const stages = ["lead", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"] as const;
    const dealData = [];

    // 為每個客戶生成 3-5 個交易
    for (const client of insertedClients) {
      const dealCount = Math.floor(Math.random() * 3) + 3;
      for (let i = 0; i < dealCount; i++) {
        const stage = stages[Math.floor(Math.random() * stages.length)];
        const amount = (Math.random() * 900000 + 100000).toFixed(2);
        const probability = stage === "closed_won" ? "100" : stage === "closed_lost" ? "0" : (Math.random() * 90).toFixed(0);
        
        // 生成過去 6 個月到未來 6 個月的隨機日期
        const dateOffset = Math.floor(Math.random() * 365) - 180;
        const expectedCloseDate = new Date();
        expectedCloseDate.setDate(expectedCloseDate.getDate() + dateOffset);

        dealData.push({
          clientId: client.id,
          title: `${client.name} - Project ${String.fromCharCode(65 + i)}`,
          amount,
          stage,
          probability,
          expectedCloseDate,
        });
      }
    }

    const insertedDeals = await db.insert(deals).values(dealData).returning();

    console.log("📝 Seeding activities...");
    const activityTypes = ["note", "call", "meeting", "email", "task"] as const;
    const sentiments = ["positive", "neutral", "negative"];
    const activityData = [];

    // 為每個交易生成 2-4 個活動
    for (const deal of insertedDeals) {
      const activityCount = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < activityCount; i++) {
        const dateOffset = Math.floor(Math.random() * 30); // 過去 30 天內
        const performedAt = new Date();
        performedAt.setDate(performedAt.getDate() - dateOffset);

        activityData.push({
          clientId: deal.clientId,
          dealId: deal.id,
          type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
          content: `Automated activity update for ${deal.title} - Step ${i + 1}`,
          sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
          performedAt,
        });
      }
    }

    await db.insert(activities).values(activityData);

    console.log(`✅ CRM Seeding completed successfully!`);
    console.log(`📊 Summary: ${insertedClients.length} Clients, ${insertedDeals.length} Deals, ${activityData.length} Activities`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
