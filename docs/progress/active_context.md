# Active Context

## Current Focus
- **Goal**: Implement Agent Core Infrastructure.
- **Status**: Phase 2 - Agent Core Implementation.
- **Current Task**: Completed initial Agent Core integration (LangGraph, Postgres Checkpointer, Server Actions, Chat UI).

## Recent Changes
- **Agent Core Implementation**:
    - Implemented `PostgresSaver` in `src/features/agent-core/server/checkpointer.ts` for persistent thread management.
    - Setup LangGraph Orchestrator (`workflow`, `runner`) in `src/features/agent-core/graph`.
    - Created `MCPClientFactory` in `src/features/agent-core/server/mcp-factory.ts` for dynamic tool loading.
    - Implemented Server Action `invokeAgent` in `src/features/agent-core/server/actions.ts`.
    - Built `Chat` component (`src/features/agent-core/ui/chat.tsx`) and Generative UI Registry (`registry.tsx`).
    - Added Agent Chat Page (`/dashboard/agent`).
- **Database Updates**:
    - Updated Drizzle Schema for `checkpoints` and `checkpoint_writes` to support LangGraph persistence.
    - Reset and re-migrated database to resolve schema conflicts.

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
