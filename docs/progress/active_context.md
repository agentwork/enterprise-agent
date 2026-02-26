# Active Context

## Current Focus
**Phase 3: Business Logic Implementation (CRM & Knowledge Base)**

We have completed the foundational architecture (Platform Core, Agent Core) and detailed feature specifications. Now we are moving into building the actual business logic, starting with the CRM module as the primary data source and the Knowledge Base for unstructured context.

## Recent Achievements
- **Feature Documentation**: Created detailed specifications for all 6 core modules, including Key Flows, User Scenarios, and Data Schemas.
- **Agent Core**: Implemented LangGraph runtime with Postgres persistence and Generative UI registry.
- **Auth System**: Fully functional RBAC with Supabase Auth.

## Next Steps (Execution Plan)

### 1. CRM Module (Priority 1)
- **Schema Implementation**:
    - Create `src/features/crm/schema.ts` defining `clients`, `contacts`, `deals`, `activities`.
    - Run `drizzle-kit push` to apply changes.
- **MCP Tools**:
    - Develop `src/features/crm/tools/` with `create_client`, `search_clients`, `log_activity`.
    - Implement Zod schemas for strict validation.
- **UI Components**:
    - Build `src/features/crm/components/ClientCard.tsx` and `ActivityFeed.tsx`.
    - Register components in `src/features/agent-core/ui/registry.tsx`.

### 2. Knowledge Base (Priority 2)
- **Schema Implementation**:
    - Create `src/features/knowledge/schema.ts` defining `documents` and `document_chunks` (with vector support).
- **Ingestion Pipeline**:
    - Implement file upload server action.
    - Create background job for parsing and embedding (using OpenAI `text-embedding-3-small`).
- **RAG Tool**:
    - Implement `search_knowledge_base` tool for semantic retrieval.

## Active Questions
- **Embedding Model**: Confirming usage of `text-embedding-3-small` (1536 dimensions).
- **Vector Index**: Need to ensure `ivfflat` or `hnsw` index is created for performance.
