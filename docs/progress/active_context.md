# Active Context

## Current Focus
**Strengthening Agent Core & MCP Integration**

The user has requested to strengthen the Agent Core and MCP development. We have upgraded the LangGraph Orchestrator to a full ReAct-style agent that dynamically discovers and executes MCP tools, and added Admin capabilities for managing these configurations.

## Recent Achievements
- **Admin Configuration**: Created `system_settings` and `mcp_servers` tables. Implemented Admin UI (`/admin/settings`) to manage LLM keys, models, and MCP servers.
- **MCP Integration**: Enhanced `MCPClientFactory` to load server configurations from the database on initialization. Added UI for adding/removing MCP servers.
- **Agent Core**: Updated `agentNode` to dynamically fetch LLM configuration (Provider, Model, API Key) from the database. Added support for **Anthropic (Claude)** models alongside OpenAI.
- **Generative UI**: Created `DataChart` (using Recharts) and `DocumentPreview` components. Registered them in the UI registry to render structured tool outputs.
- **Documentation**: Created `docs/admin-guideline.md` covering Admin operations, local Supabase MCP setup, and model key application.

## Next Steps (Execution Plan)

### 1. Integration Testing
- **Goal**: Verify the end-to-end flow with a real MCP server.
- **Tasks**:
    - Spin up a Supabase MCP server locally.
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
