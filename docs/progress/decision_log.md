# Decision Log

## 2026-02-26: Generative UI & Agent Robustness

- **Currency-Aware Charting**:
  - Implemented a custom parser in `DataChart` to handle raw database strings, specifically stripping currency symbols ($) and commas (,) to ensure Recharts can plot numeric data accurately.
  - Added a "Heuristic Trigger" in `registry.tsx` to detect chart-compatible data structures even when the tool name is unknown.

- **Agent Schema Enforcement**:
  - Injected explicit system instructions into the LangGraph orchestrator to solve the mismatch between AI-generated SQL and the actual Drizzle/Supabase schema (e.g., forcing `expected_close_date` instead of `expectedCloseDate`).

- **Conversational Data Rendering**:
  - Updated `Chat` UI to detect JSON blocks in the Agent's text response. This allows users to paste data manually or ask the AI to "output JSON" to trigger an immediate chart visualization, bypassing the need for explicit tool execution.

- **Zero-Lint Architecture**:
  - Refactored `registry.tsx` and `chat.tsx` to eliminate `any` types and unused variables, achieving a clean `pnpm lint` pass and ensuring consistent UI behavior.

## 2026-02-26: Project Architecture & Database

- **Tech Stack Selection**:
  - **Next.js 16**: Utilizing App Router and modern server components.
  - **Drizzle ORM**: For type-safe database access and modular schema definitions.
  - **Supabase Local**: For development speed and built-in auth, storage, and pgvector support.
  - **LangChain/LangGraph**: Orchestrator for complex agentic workflows and memory persistence.

- **Schema Strategy**:
  - Modularized into `auth`, `crm`, `knowledge`, and `agent` to support feature-base development.
  - **Auth**: Profile-based role management (Admin, Manager, Staff).
  - **Knowledge**: Using `pgvector` for RAG-enabled document search.
  - **Agent**: Persistent checkpointing of LangGraph state in Postgres.

- **Directory Structure**:
  - Strict separation of `/admin` (System controls) and `/dashboard` (User tools) to enforce RBAC.
  - Feature-Base layout (`src/features/*`) to allow independent development of business modules.

## 2026-02-26: Auth System Implementation (Phase 1)

- **Auth Strategy**:
  - **Supabase Auth**: Utilizing Supabase SSR package for secure server-side session management.
  - **Middleware Protection**: Implemented `src/middleware.ts` to protect routes and handle session refreshing.
  - **RBAC Enforcement**: Middleware checks for `/admin` access by querying user profile roles (future optimization: custom claims).
  - **Server Actions**: Encapsulated Login/Logout logic in Server Actions (`src/features/auth/server/actions.ts`) for type safety and progressive enhancement.
  - **Validation**: Using `zod` for strict runtime validation of auth inputs.
  - **Testing**: Added Jest unit tests for Server Actions to ensure logic correctness before UI integration.

## 2026-02-26: Code Quality & Maintenance

- **Centralized Model Factory**: 
    - Moved dynamic model initialization from `src/features/agent-core/graph/index.ts` to a dedicated `src/features/agent-core/server/model-factory.ts`.
    - This allows both the Agent runtime and Admin testing tools to share the same configuration logic.
- **Strict Linting & Build Standards**: 
    - Cleaned up all remaining `any` types and unused variables to pass strict ESLint rules.
    - Fixed TypeScript environment variable mapping issues in `MCPClientFactory`.
    - Enforced a "zero-lint-warning" policy for core features.
- **Verification Infrastructure**: 
    - Introduced a dedicated `/admin/model-test` page for administrators to verify LLM connection status independently of the main chat interface.

## 2026-02-26: Agent Core & MCP Integration (Phase 2)

- **Agent Orchestrator**:
  - **ReAct Pattern**: Upgraded LangGraph Orchestrator from a placeholder echo bot to a full ReAct-style agent.
  - **Dynamic Tool Binding**: Agent dynamically discovers and binds MCP tools at runtime, ensuring it always has access to the latest capabilities from connected servers.
  - **State Persistence**: Leveraging `PostgresSaver` for robust session management and context retention across interactions.

- **MCP Architecture**:
  - **Client Factory**: Enhanced `MCPClientFactory` to serve as a central hub for tool discovery, caching, and execution routing.
  - **Tool Execution**: Implemented robust error handling and result serialization for tool outputs.
  - **UI Integration**: Updated `ToolOutput` component to handle JSON-structured tool results, enabling rich generative UI rendering.

- **Testing Strategy**:
  - **Unit Tests**: Added comprehensive tests for graph structure and tool execution logic to ensure stability before integration with external services.

## 2026-02-26: CRM Seeding & Dashboard Enhancement

- **Dashboard Page Implementation**:
    - Created a unified `/dashboard/crm` page to provide a bird's-eye view of CRM activities, including recent clients and active deals.
- **CRM Seeding Script**:
    - Implemented a robust seed script at `src/lib/db/seed-crm.ts` that populates the database with sample CRM data (clients, deals, and activities) to accelerate development and testing.
    - Integrated the seed command as `npm run db:seed` in `package.json` using `tsx` for TypeScript execution.

## 2026-02-26: Knowledge Base & RAG Implementation (Phase 3)

- **Vector Search Engine**:
  - **pgvector Integration**: Successfully utilized `pgvector` within Supabase to store and query high-dimensional embeddings.
  - **OpenAI Embeddings**: Integrated `text-embedding-3-small` for generating high-quality vector representations of documents and queries.
  - **Hybrid Configuration**: Implemented a fallback mechanism for API keys that checks both encrypted database settings and local environment variables.

- **RAG Pipeline**:
  - **Chunking Strategy**: Employed `RecursiveCharacterTextSplitter` from LangChain to handle long documents efficiently while maintaining context across segments.
  - **Dynamic Ingestion**: Developed server actions that handle document upload, chunking, and embedding generation in a single atomic flow.

- **Agent Tooling**:
  - **Search & Ingest**: Created `knowledge_search` and `knowledge_add_document` tools, enabling the agent to both retrieve information and save new knowledge autonomously.
  - **Generative UI Registry**: Mapped knowledge tool outputs to `DocumentPreview` for rich, interactive document results in the chat interface.

## 2026-02-26: Analytics Module & Dashboard Integration

- **Visualization Strategy**:
  - **Recharts**: Selected `recharts` for its composable, responsive, and React-native architecture.
  - **Server-Side Aggregation**: Implemented data aggregation (GROUP BY, SUM, COUNT) directly in Drizzle ORM Server Actions to minimize client-side processing.

## 2026-02-26: Proposal Generator Implementation (Phase 4)

- **Document Architecture**:
  - **Schema Design**: Defined `templates` and `proposals` tables in Drizzle to handle modular document structures and persistent drafts.
  - **RLS Policies**: Implemented row-level security for proposals to ensure data isolation between users.

- **AI Content Generation**:
  - **LangGraph Integration**: Developed `generateSectionContent` to invoke the AI agent for context-aware drafting based on CRM data and Knowledge Base.
  - **Multi-Format Support**: Engineered the agent to produce and parse structured content, including **Text**, **Lists**, and **Tables** (via JSON serialization).

- **Interactive Editor & Preview**:
  - **Dynamic Sections**: Built a client-side editor that maps template structures to specific input components (textarea, list editor, table viewer).
  - **Preview Mode**: Implemented a "Print-ready" preview mode for document review before export.
  - **JSON Fallback**: Provided a raw JSON editor for tables to ensure technical users can manually refine structured AI outputs.

- **System-Wide Integration**:
  - **Dashboard Hub**: Integrated the Proposal module into the main Enterprise Dashboard.
  - **Zero-Lint Compliance**: Refactored all proposal components to eliminate `any` types and unused variables, maintaining the project's strict code quality standards.

- **Dashboard Architecture**:
  - **Hub-and-Spoke Navigation**: Redesigned `/dashboard` as a central navigation hub, providing clear entry points to all modules (Agent, CRM, Knowledge, Analytics).
  - **Unified Metric Cards**: Standardized the display of key performance indicators (KPIs) across the dashboard.

