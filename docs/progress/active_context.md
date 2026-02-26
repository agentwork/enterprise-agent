# Active Context

## Current Focus
- **Goal**: Implement Auth System & RBAC.
- **Status**: Phase 1 - Auth Implementation (Part 1 Completed).
- **Current Task**: Auth System verified with Unit Tests. Moving to Integration.

## Recent Changes
- **Auth Implementation**:
    - Created feature branch `feature/auth-system`.
    - Implemented Supabase Clients (`client.ts`, `server.ts`) in `src/lib/supabase`.
    - Implemented Middleware (`middleware.ts`) for Session Management and RBAC (`/admin` protection).
    - Created Auth Server Actions (`login`, `logout`) with Zod validation.
    - Built Login UI (`LoginForm`) and Login Page (`/auth/login`).
    - Added Unit Tests for Auth Actions using Jest.
- **Database Setup**:
    - Initialized Supabase project locally (`npx supabase init`).
    - Configured Drizzle (`drizzle.config.ts`, `src/lib/db`).
    - Implemented Drizzle Schemas: `auth`, `crm`, `knowledge`, `agent`.
    - Enabled `pgvector` extension and applied migrations (`npx drizzle-kit migrate`).
    - Fixed TypeScript module resolution for `src/lib/db/index.ts`.
- **Project Initialization**:
    - Initialized Next.js 16 (App Router, Tailwind, TypeScript, ESLint).
    - Installed core dependencies: `supabase-js`, `drizzle-orm`, `langchain`, `zod`.
    - Scaffolded Feature-Base directory structure (`src/features/*`, `src/shared/*`).
- **Documentation Update**:
    - Unified all documentation to English.
    - Finalized `docs/feature-base.md` and `docs/schema/schema-index.md`.
    - Enforced strict RBAC directory structure (`/admin` vs `/dashboard`).

## Next Steps (Phase 1 Implementation)
1.  **Auth Implementation**:
    - Configure Supabase Auth.
    - Implement Middleware for RBAC (`/admin` protection).
2.  **Agent Core Setup**:
    - Initialize LangGraph runtime in `src/features/agent-core`.

## Open Questions
- Need to confirm the specific Embedding Model (OpenAI `text-embedding-3-small` or local). defaulting to OpenAI dimensions (1536).
