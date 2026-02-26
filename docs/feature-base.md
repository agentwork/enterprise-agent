# Feature Base Development Guideline

## Document Overview
This guideline defines the **Feature Base (Feature-Driven)** architecture standards for the Next.js 16 project, specifically tailored for the **Enterprise Agent (EA)** platform. It covers directory structure, tech stack implementation, coding rules, permission control, and team workflows.

---

## 1. Core Principles
### 1.1 Feature Cohesion (Mandatory)
- All code related to a single feature (components, server logic, types, validation, hooks) lives **within one feature directory**, not split by technical type.
- Clear feature boundaries: Adding/removing/modifying a feature only affects its own directory.
- Reusable logic across features is extracted to `shared/`.
- **Agent Core Principle**: All AI/Agent-specific infrastructure (LangGraph, MCP Clients, Memory) lives in `src/features/agent-core`.

### 1.2 Strict Separation of Concerns
- **Server/Client Isolation**: Server-side logic (DB queries, auth, permissions) lives only in `server/`; client-side logic (interactions, forms, state) lives only in `client/`.
- **Role Isolation**: Enterprise roles (Admin, Manager, Staff) access specific features enforced by Supabase RBAC + RLS.
- **Tech Stack Boundaries**: Drizzle for data access, Zod for validation, Shadcn/Tailwind for UI.

### 1.3 Maintainability & Scalability
- Uniform directory structure across all features.
- Mandatory TypeScript, ESLint, Prettier, and Vitest testing.

---

## 2. Tech Stack & Implementation Rules
| Technology | Primary Purpose | Implementation Rules |
| :--- | :--- | :--- |
| **Next.js 16** | Framework (RSC, Server Actions, App Router) | Use App Router; business logic lives in `src/features/`. |
| **Supabase** | Database, storage, auth, Vector | Use with Drizzle; Auth for identity; RLS for row-level data security. |
| **Drizzle ORM** | Type-safe database access | Schemas in `src/lib/db/schema`; queries in feature `server/` directories. |
| **Shadcn UI** | Reusable UI components | Base components in `src/shared/components/ui`; feature-specific in `src/features/`. |
| **Tailwind CSS** | Utility-first styling | Global styles in `src/shared/styles`. |
| **Zod** | Runtime data validation | Schemas per feature in `types.ts`; reused server/client. |
| **Vercel AI SDK** | AI Integration | Used for streaming UI responses and basic chat handling. |
| **LangChain/Graph** | Agent Orchestration | Core Logic in `agent-core`; defines state machines and tools. |
| **MCP** | Model Context Protocol | Standardized interface for Agents to call internal APIs and external tools. |
| **Vitest** | Unit & integration testing | Tests live with feature code. |

---

## 3. Directory Structure (Mandatory)
The structure reflects the Enterprise Business Domain (CRM, Analytics, Knowledge Base) and the Agent Infrastructure.

```text
enterprise-agent/
├── src/                      # Source Code
│   ├── app/                  # Next.js App Router (Routes Only)
│   │   ├── layout.tsx        # Root layout
│   │   ├── auth/             # Public Auth (Login, Reset Password)
│   │   ├── dashboard/        # Main User Interface (Staff, Manager)
│   │   │   ├── layout.tsx    # Dashboard Shell (Sidebar + Header)
│   │   │   ├── page.tsx      # Overview Dashboard
│   │   │   ├── crm/          # CRM Routes
│   │   │   ├── knowledge/    # Knowledge Base Routes
│   │   │   └── analytics/    # Analytics Routes
│   │   ├── admin/            # System Admin Console (Admin Only)
│   │   │   ├── layout.tsx    # Admin Shell (Advanced Controls)
│   │   │   ├── page.tsx      # Admin Dashboard
│   │   │   ├── users/        # User & Role Management
│   │   │   └── config/       # Model & MCP Configuration
│   │   └── api/              # API Routes (Webhooks, MCP Servers)
│   ├── features/             # Feature Base Core (Business Logic)
│   │   ├── agent-core/       # [P0] SHARED BRAIN (LangGraph, MCP, Memory)
│   │   │   ├── graph/        # State Definitions & Nodes
│   │   │   ├── tools/        # Base Tool Classes & Registry
│   │   │   ├── memory/       # Checkpoint Savers (Supabase Adapter)
│   │   │   └── components/   # ChatWindow, GenerativeUIRenderer
│   │   ├── auth/             # [P0] Authentication & RBAC
│   │   │   ├── components/   # LoginForm, UserProfile
│   │   │   ├── server/       # Session Management
│   │   │   └── types.ts      # User Roles
│   │   ├── crm/              # [P1] Sales Copilot
│   │   │   ├── components/   # ClientList, ClientCard
│   │   │   ├── server/       # DB Actions (Clients, Interactions)
│   │   │   ├── tools/        # MCP Tools (create_client, get_client)
│   │   │   └── types.ts      # ClientSchema
│   │   ├── knowledge-base/   # [P1] RAG System
│   │   │   ├── components/   # FileUploader, SearchResults
│   │   │   ├── server/       # Vector Embeddings, Ingestion
│   │   │   └── tools/        # MCP Tools (search_docs)
│   │   ├── analytics/        # [P2] Data Agent
│   │   │   ├── components/   # ChartRenderer (Generative UI)
│   │   │   ├── server/       # SQL Execution (ReadOnly)
│   │   │   └── tools/        # MCP Tools (run_sql_query)
│   │   ├── proposals/        # [P2] Content Generation
│   │   │   ├── components/   # ProposalBuilder
│   │   │   └── server/       # PDF Generation
│   │   └── admin/            # [P1] Admin Console
│   │       ├── components/   # UserTable, ModelConfig
│   │       └── server/       # Admin Actions
│   ├── shared/               # Global shared resources
│   │   ├── components/       # Shadcn UI (Button, Input, Table)
│   │   ├── hooks/            # useDebounce, useClickOutside
│   │   └── lib/              # Utils (cn, formatters)
│   ├── lib/                  # Third-party integrations
│   │   ├── db/               # Drizzle Setup
│   │   │   ├── schema/       # Database Schema Definitions
│   │   │   │   ├── auth.ts
│   │   │   │   ├── crm.ts
│   │   │   │   ├── knowledge.ts
│   │   │   │   └── ...
│   │   │   └── index.ts
│   │   └── ai/               # AI Client Config (OpenAI/Anthropic)
│   └── middleware.ts         # Auth Protection
├── supabase/                 # Local Supabase Config
├── public/
└── ... config files
```

---

## 4. Database Management Strategy (Supabase + Drizzle)
We use a **Hybrid Approach**: Drizzle for Schema/Types, Supabase for RLS/Triggers.

### 4.1 Schema Definition
- **Location**: `src/lib/db/schema/*.ts`
- **Modules**:
    - `auth`: Users, Profiles, Roles.
    - `crm`: Clients, Contacts, Deals, Activities.
    - `knowledge`: Documents, Chunks, Embeddings (pgvector).
    - `chat`: Threads, Messages, Checkpoints (LangGraph Persistence).

### 4.2 RLS Policies (Security)
- **Concept**: Security logic lives in the Database.
- **Example**:
  - Staff can view only their assigned Clients.
  - Admins can view everything.
  - Agents operate under the context of the current user.

---

## 5. Development Workflow
### 5.1 Local Development
1.  **Start Supabase**: `npx supabase start`
2.  **Migrate**: `pnpm db:migrate`
3.  **Seed**: `pnpm db:seed` (Populates mock Clients and Knowledge Base)

### 5.2 Feature Implementation Steps (CRM Example)
1.  **Schema**: Define `clients` table in `src/lib/db/schema/crm.ts`.
2.  **Types**: Create Zod schema in `src/features/crm/types.ts`.
3.  **Tools**: Define `create_client` MCP Tool in `src/features/crm/tools/`.
4.  **Server**: Implement Server Actions used by the Tool.
5.  **UI**: Build `ClientCard` component to display the result (Generative UI).

---

## 6. Coding Standards
- **Naming**: `kebab-case` for directories, `PascalCase` for components, `camelCase` for functions.
- **Strict Typing**: No `any`. Use Zod for all API inputs and Tool Arguments.
- **AI Integration**:
    - All AI tools must be defined in `src/features/<feature>/tools/`.
    - Use MCP pattern for tool definition (Input Schema + Execute Function).

## 7. Summary
This architecture ensures the **Enterprise Agent (EA)** platform is scalable, secure, and modular. The `agent-core` provides the brain, while feature modules provide the capabilities.
