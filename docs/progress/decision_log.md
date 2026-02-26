# Decision Log

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

## 2026-02-26: Agent Runtime Bug Fixes

- **Tool Binding Compatibility**:
    - Fixed a `TypeError: model.bind is not a function` by updating the agent's tool binding logic in `src/features/agent-core/graph/index.ts` to support both modern `bindTools` and legacy `bind` methods.
- **OpenAI API Compliance**:
    - Resolved a `400 Missing required parameter: 'tools[0].type'` error by correctly formatting tool definitions in `src/features/agent-core/graph/tools.ts` to include the mandatory `"type": "function"` structure required by the OpenAI API.
- **Linter Cleanup**:
    - Resolved all remaining ESLint errors, including an "impure function" error in the CRM dashboard related to `Date.now()`.
