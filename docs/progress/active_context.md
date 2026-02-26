# Active Context

## Current Focus
**Strengthening Agent Core, MCP Integration & System Stability**

The project is currently focused on stabilizing the Agent Core and MCP integration, improving developer experience with local setup guides, and providing admin tools for system verification.

## Recent Achievements
- **System Stability & Quality**: 
    - Resolved critical TypeScript and Lint errors across the codebase.
    - Successfully passed `pnpm lint` and `pnpm build` processes.
    - Refactored model initialization into a centralized [model-factory.ts](file:///Users/sam/Workspace/agentwork/enterprise-agent/src/features/agent-core/server/model-factory.ts).
- **Admin Verification Tools**:
    - Implemented a [Model Connection Test](file:///Users/sam/Workspace/agentwork/enterprise-agent/src/app/admin/model-test/page.tsx) page to verify LLM provider configurations.
    - Created a corresponding Server Action [test-model.ts](file:///Users/sam/Workspace/agentwork/enterprise-agent/src/features/admin/server/test-model.ts) for execution.
- **Developer Experience**:
    - Created a comprehensive [Local Supabase & Docker Setup Guide](file:///Users/sam/Workspace/agentwork/enterprise-agent/docs/supabase-local.md).
    - Updated [Admin Guideline](file:///Users/sam/Workspace/agentwork/enterprise-agent/docs/admin-guideline.md) to include model testing and local setup instructions.
- **Admin Configuration**: Created `system_settings` and `mcp_servers` tables. Implemented Admin UI (`/admin/settings`) to manage LLM keys, models, and MCP servers.
- **MCP Integration**: Enhanced `MCPClientFactory` to load server configurations from the database on initialization. Added UI for adding/removing MCP servers.
- **Agent Core**: Updated `agentNode` to dynamically fetch LLM configuration (Provider, Model, API Key) from the database. Added support for **Anthropic (Claude)** models alongside OpenAI.
- **Generative UI**: Created `DataChart` (using Recharts) and `DocumentPreview` components. Registered them in the UI registry to render structured tool outputs.

## Next Steps (Execution Plan)

### 1. Integration Testing
- **Goal**: Verify the end-to-end flow with a real MCP server.
- **Tasks**:
    - Spin up a Supabase MCP server locally (following the new [Supabase Local Guide](file:///Users/sam/Workspace/agentwork/enterprise-agent/docs/supabase-local.md)).
    - Add it via the Admin UI.
    - Chat with the agent to query data and verify `DataChart` rendering.

### 2. Knowledge Base Implementation
- **Goal**: Implement the RAG pipeline.
- **Tasks**:
    - Create `knowledge` feature module.
    - Implement document ingestion (PDF/Text) to `pgvector`.
    - Create an MCP server (or tool) for semantic search.

### 3. CRM Module
- **Goal**: Build the CRM features.
- **Tasks**:
    - Implement Client/Deal management UI.
    - Create MCP tools for CRM operations (Add Client, Update Deal).

## Active Questions
- **Deployment**: How to handle MCP server processes in a production deployment (e.g., Vercel)? Currently using `StdioClientTransport` which spawns subprocesses. This works locally or on a VPS/Container, but not on Vercel Edge/Serverless easily. Might need SSE transport for remote MCP servers.
- **System Settings Encryption**: Currently `isEncrypted` flag exists in `system_settings` but actual encryption/decryption logic for API keys is not yet implemented. Need to decide on an encryption library (e.g., `crypto`).

