# Active Context

## Current Focus
- **Goal**: Initialize Enterprise Agent (EA) Platform.
- **Status**: Phase 1 - Project Initialization & Foundation.
- **Current Task**: Database Setup & Auth Implementation.

## Recent Changes
- **Project Initialization**:
    - Initialized Next.js 16 (App Router, Tailwind, TypeScript, ESLint).
    - Installed core dependencies: `supabase-js`, `drizzle-orm`, `langchain`, `zod`.
    - Scaffolded Feature-Base directory structure (`src/features/*`, `src/shared/*`).
- **Documentation Update**:
    - Unified all documentation to English.
    - Finalized `docs/feature-base.md` and `docs/schema/schema-index.md`.
    - Enforced strict RBAC directory structure (`/admin` vs `/dashboard`).

## Next Steps (Phase 1 Implementation)
1.  **Database Setup**:
    - Initialize Supabase project locally.
    - Create Drizzle Config & Client (`src/lib/db`).
    - Apply Schema Migrations (`auth`, `crm`, `knowledge`, `agent`).
2.  **Auth Implementation**:
    - Configure Supabase Auth.
    - Implement Middleware for RBAC (`/admin` protection).
3.  **Agent Core Setup**:
    - Initialize LangGraph runtime in `src/features/agent-core`.

## Open Questions
- Need to confirm the specific Embedding Model (OpenAI `text-embedding-3-small` or local). defaulting to OpenAI dimensions (1536).
