# Active Context

## Current Focus
**CRM Module Completed**

We have completed the development of the CRM (Customer Relationship Management) module, including core functionality, UI components, server actions, and integration with the Agent Core via MCP tools.

## Recent Achievements
- **CRM Module**: Implemented full CRUD for Clients, Deals, and Activities.
    - **Schema**: Defined `clients`, `contacts`, `deals`, and `activities` tables.
    - **Server Actions**: Implemented actions for data manipulation.
    - **UI Components**: Created forms and lists for Clients and Deals, and an Activity Feed.
    - **Pages**: Completed `/dashboard/crm` pages for listing and details.
    - **Testing**: Comprehensive unit tests for all CRM server actions (Clients, Deals, Activities).
    - **MCP Integration**: Created `crmTools` and integrated them into the Agent Core (`getMCPToolsForModel`), enabling the AI agent to perform CRM actions directly.
- **Code Quality**: Resolved all lint errors and type issues in the CRM module.

## Next Steps (Execution Plan)

### 1. Knowledge Base Implementation (Next)
- **Goal**: Implement the RAG pipeline.
- **Tasks**:
    - Create `knowledge` feature module.
    - Implement document ingestion (PDF/Text) to `pgvector`.
    - Create an MCP server (or tool) for semantic search.

### 2. Analytics Module (Planned)
- **Goal**: Implement dashboard analytics.
- **Tasks**:
    - Create `analytics` feature module.
    - Implement charts and graphs for CRM data.

## Active Questions
- **Deployment**: How to handle MCP server processes in a production deployment (e.g., Vercel)? Currently using `StdioClientTransport` which spawns subprocesses. This works locally or on a VPS/Container, but not on Vercel Edge/Serverless easily. Might need SSE transport for remote MCP servers.
- **System Settings Encryption**: Currently `isEncrypted` flag exists in `system_settings` but actual encryption/decryption logic for API keys is not yet implemented. Need to decide on an encryption library (e.g., `crypto`).
