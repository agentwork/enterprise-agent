# Feature Overview & Planning

This document details the feature roadmap, prioritization, and the architectural "Agent Core" that powers the Enterprise AI Agent Platform.

## 1. The "Agent Core" Layer
To ensure scalability and reusability, we define a **Core Layer** (`src/features/agent-core`) that provides shared capabilities to all business features. All specific features (CRM, Analytics) must build upon these primitives.

### 1.1 Core Capabilities
| Component | Function | Shared By |
| :--- | :--- | :--- |
| **LangGraph Orchestrator** | Manages the state machine, conversation history, and routing between specialized agents. | All Features |
| **MCP Client Factory** | A unified client to connect to internal (Supabase) and external MCP servers. Handles tool discovery and execution. | CRM, Analytics, Admin |
| **Generative UI Registry** | Maps tool outputs to React Components (e.g., `client-list` -> `<ClientCard />`, `sql-result` -> `<DataChart />`). | Dashboard, Reporting |
| **Approval Workflow** | A standard UI/UX pattern for "Human-in-the-Loop" confirmations. Used for destructive or high-stakes actions. | CRM (Delete), Finance (Pay) |
| **Vector Memory** | A shared interface for storing and retrieving semantic context (Long-term memory). | Knowledge Base, CRM |

---

## 2. Feature Matrix & Prioritization

### Priority Levels
- **P0 (Critical)**: Essential infrastructure; system cannot run without it.
- **P1 (High)**: Core business value; required for MVP launch.
- **P2 (Medium)**: Enhanced functionality; improves UX but not blocking.
- **P3 (Low)**: Future expansion; nice-to-have.

### Feature Table

| Priority | Feature Module | Component / Function | Description | Dependencies | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **P0** | **Platform Core** | **Authentication & RBAC** | Supabase Auth integration, Role management (Admin, Manager, Staff), RLS policies. | None | Shared |
| **P0** | **Agent Core** | **Runtime Engine** | LangGraph setup, State checkpointing in DB, Streaming response handler. | Next.js, Supabase | AI Core |
| **P0** | **Agent Core** | **MCP Integration** | Connection to Supabase Database via MCP; Tool definition schema (Zod). | Runtime Engine | AI Core |
| **P1** | **CRM (Sales)** | **Client Management** | Natural language create/read/update of Client profiles. | Agent Core, Auth | Business |
| **P1** | **CRM (Sales)** | **Activity Logging** | Log meetings, calls, and notes via chat. Auto-summarize interaction history. | Client Mgmt | Business |
| **P1** | **Knowledge Base** | **Document Ingestion** | Upload PDF/Docx/URL. Chunking and embedding into Supabase Vector. | Agent Core | AI Core |
| **P1** | **Knowledge Base** | **RAG Search** | Semantic search tool for Agents to answer questions based on internal docs. | Document Ingestion | AI Core |
| **P1** | **Dashboard** | **Chat Interface** | Main UI for user interaction. Supports markdown, streaming, and tool calls. | Agent Core | Frontend |
| **P1** | **Admin** | **User Management** | UI to invite users and assign roles. | Auth | Admin |
| **P2** | **Analytics** | **Text-to-SQL** | Agent capability to translate natural language to SQL queries safely. | Agent Core, MCP | Data |
| **P2** | **Analytics** | **Data Visualization** | Generative UI components for Line/Bar/Pie charts based on SQL results. | Text-to-SQL | Frontend |
| **P2** | **Proposals** | **Draft Generation** | AI generates proposal structure based on Client data + Knowledge Base templates. | CRM, Knowledge Base | Business |
| **P2** | **Proposals** | **Export Engine** | Convert generated content to PDF or Slide format. | Draft Generation | Shared |
| **P3** | **Work Orders** | **Task Dispatch** | Assign tasks to internal teams (Design, Media) via chat. | CRM, Auth | Ops |
| **P3** | **Admin** | **Model Config** | Switch LLM providers (OpenAI, Anthropic, Google) via UI. | Agent Core | Admin |

---

## 3. Implementation Plan (Feature-Base)

### 3.1 Directory Structure
We strictly follow the Feature-Base pattern.

```text
src/features/
├── agent-core/           # THE SHARED BRAIN
│   ├── graph/            # LangGraph State Definitions
│   ├── tools/            # Base Tool Classes
│   ├── memory/           # Checkpoint Savers
│   └── components/       # ChatWindow, ApprovalCard
├── auth/                 # Authentication & RBAC
├── crm/                  # Sales Copilot
│   ├── tools/            # MCP Tools: create_client, get_client
│   └── components/       # ClientCard, ActivityFeed
├── knowledge-base/       # RAG System
│   ├── tools/            # MCP Tools: search_docs
│   └── server/           # Vector Embedding Logic
├── analytics/            # Data Agent
│   ├── tools/            # MCP Tools: run_sql_query
│   └── components/       # ChartRenderer
└── ...
```

### 3.2 Development Rules for Features
1.  **Define Tools First**: Before writing UI, define the MCP Tools (Zod Schema + Execute Function) the Agent will use.
2.  **Strict Typing**: All Agent inputs/outputs must be typed.
3.  **Shared Core Usage**: Do not reinvent the wheel. Import `AgentRuntime` from `src/features/agent-core`.
4.  **Generative UI**: Design components to be rendered by the Agent, not just by the Router.

---

## 4. Next Steps
1.  **Initialize `agent-core`**: Build the basic LangGraph runtime.
2.  **Build `auth`**: Secure the platform.
3.  **Implement `crm` (MVP)**: First proof of concept for "Chat-to-Database" via MCP.
