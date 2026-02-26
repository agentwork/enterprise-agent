# Active Context

## Current Focus
- **Goal**: Implement Agent Core Infrastructure.
- **Status**: Phase 2 - Agent Core Implementation (Stabilized).
- **Current Task**: Completed Agent Core infrastructure with persistent thread management, Generative UI, and bug fixes for reliability.

## Recent Changes
- **Agent Core Stabilization**:
    - Fixed `PostgresSaver` in `src/features/agent-core/server/checkpointer.ts` to handle `undefined` values in `checkpoint_writes` by converting to `null`.
    - Updated `invokeAgent` server action in `src/features/agent-core/server/actions.ts` to safely handle serialized LangChain messages (fixed `_getType` error).
    - Resolved database schema desync by running `drizzle-kit push` after manual resets.
- **Agent Core Implementation**:
    - Implemented `PostgresSaver` for persistent thread management.
    - Setup LangGraph Orchestrator (`workflow`, `runner`) in `src/features/agent-core/graph`.
    - Created `MCPClientFactory` for dynamic tool loading.
    - Built `Chat` component (`src/features/agent-core/ui/chat.tsx`) and Generative UI Registry (`registry.tsx`).
    - Added Agent Chat Page (`/dashboard/agent`).
- **Code Quality**:
    - Fixed all ESLint warnings and errors across the codebase (unused variables, component-in-render issues).
- **Database Updates**:
    - Updated Drizzle Schema for `checkpoints` and `checkpoint_writes` (nullable values for stability).

## Next Steps (Phase 3 Implementation)
1.  **MCP Integration**:
    - Connect `MCPClientFactory` to actual MCP servers (e.g., Supabase MCP).
    - Register MCP tools in the LangGraph workflow.
2.  **Knowledge Base**:
    - Implement RAG pipeline using `pgvector`.
3.  **CRM Module**:
    - Build CRM UI and actions.

## Open Questions
- Need to confirm the specific Embedding Model (OpenAI `text-embedding-3-small` or local). defaulting to OpenAI dimensions (1536).
