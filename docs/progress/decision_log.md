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
