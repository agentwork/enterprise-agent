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
