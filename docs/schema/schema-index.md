# Database Schema Design (Drizzle ORM)

This document defines the database schema for the Enterprise Agent (EA) platform. We use **Drizzle ORM** for TypeScript definitions and **Supabase** (PostgreSQL) for storage and vector search.

## 1. Auth & Users (`auth`)
Managed by Supabase Auth, extended with a public `profiles` table.

```typescript
// src/lib/db/schema/auth.ts
import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "manager", "staff"]);

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().references(() => auth.users.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  fullName: text("full_name"),
  role: userRoleEnum("role").default("staff").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

## 2. CRM Module (`crm`)
Stores client relationships, contacts, and activity logs.

```typescript
// src/lib/db/schema/crm.ts
import { pgTable, uuid, text, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
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
```

## 3. Knowledge Base (`knowledge`)
Stores documents and their vector embeddings for RAG.
**Requires `pgvector` extension.**

```typescript
// src/lib/db/schema/knowledge.ts
import { pgTable, uuid, text, timestamp, jsonb, vector, integer } from "drizzle-orm/pg-core";

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  content: text("content"), // Full text content
  filePath: text("file_path"), // Path in Supabase Storage
  fileType: text("file_type"), // pdf, docx, url
  metadata: jsonb("metadata"), // Author, date, tags
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documentChunks = pgTable("document_chunks", {
  id: uuid("id").defaultRandom().primaryKey(),
  documentId: uuid("document_id").references(() => documents.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(), // The chunk text
  embedding: vector("embedding", { dimensions: 1536 }), // OpenAI ada-002
  chunkIndex: integer("chunk_index").notNull(),
  metadata: jsonb("metadata"),
});
```

## 4. Agent Core Memory (`agent`)
Stores LangGraph checkpoints and conversation history.

```typescript
// src/lib/db/schema/agent.ts
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
```

## 5. RLS Policy Strategy
We will define RLS policies using `pgPolicy` in the schema file where possible, or via SQL migration.

**Global Rules:**
1.  **Users** can read their own Profile.
2.  **Admins** have full access.
3.  **CRM**:
    - `select`: Authenticated users can view all Clients (Open Enterprise model).
    - `insert/update`: Only assigned Owners or Managers.
    - `delete`: Admins only.
4.  **Knowledge**:
    - `select`: All authenticated users.
    - `insert`: Managers and Admins.
5.  **Agent**:
    - Users can only access their own Threads and Messages.
