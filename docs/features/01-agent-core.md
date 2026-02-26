# Feature Specification: Agent Core & Runtime

## 1. Overview
The **Agent Core** is the central nervous system of the Enterprise AI Agent Platform. It provides the runtime environment for executing autonomous agents, managing conversation state, and orchestrating tool usage via the Model Context Protocol (MCP). It is designed to be modular, scalable, and reusable across all business features (CRM, Analytics, etc.).

## 2. Target Audience
- **Developers**: Extending the platform with new tools and agents.
- **System**: Other modules (CRM, Knowledge Base) consume this core service.

## 3. Key Functionality
### 3.1 LangGraph Orchestrator
- **Description**: Manages the state machine of the agent, handling the flow between "User Input" -> "Reasoning" -> "Tool Execution" -> "Response".
- **Key Flow**:
    1.  User sends a message via Chat UI.
    2.  `AgentRuntime` loads the current thread state from Postgres.
    3.  LLM decides the next step (Router).
    4.  If tool call: Execute tool via MCP -> Return output to LLM.
    5.  If final answer: Stream response to User.
- **State Management**: Uses `PostgresSaver` to persist conversation history and variable state (checkpoints) to the `checkpoints` table.

### 3.2 MCP Client Factory
- **Description**: A unified client to connect to internal and external MCP servers.
- **Capabilities**:
    - **Tool Discovery**: Dynamically list available tools from connected MCP servers.
    - **Execution**: Securely invoke tools with Zod-validated inputs.
    - **Connection Management**: Handle authentication and connection pooling for MCP servers (e.g., Supabase MCP, Slack MCP).

### 3.3 Generative UI Registry
- **Description**: Maps structured tool outputs to React Server Components for rich rendering.
- **Mechanism**:
    - The Agent returns a "Tool Result" (e.g., a JSON array of clients).
    - The UI Registry matches the tool name (e.g., `list_clients`) to a component (e.g., `<ClientListCard />`).
    - The system renders the component instead of raw JSON.

## 4. Data & Schema
- **Database Tables**:
    - `threads`: Stores conversation metadata (ID, User, Title).
    - `checkpoints`: Stores the serialized LangGraph state (v1, v2...).
    - `checkpoint_writes`: Stores pending writes/side-effects.
- **Dependencies**:
    - `langchain`, `langgraph`, `@modelcontextprotocol/sdk`.
    - `pgvector` (for future semantic memory expansion).

## 5. Integration Points
- **Input**: Accepts `HumanMessage` from the Frontend (Server Actions).
- **Output**: Returns `AIMessage` with `content` (text) and `tool_calls`.
- **External**: Connects to Supabase Database via `supabase-mcp` (planned).

## 6. User Scenarios
- **Scenario A**: User asks "Show me all clients in Tech sector".
    - Agent Core routes to `crm-agent`.
    - `crm-agent` calls `search_clients` tool.
    - Tool returns JSON data.
    - Agent Core invokes Generative UI to render a `ClientTable` component.

## 7. Future Roadmap
- **Multi-Agent Collaboration**: Hierarchical teams (Manager Agent delegating to Worker Agents).
- **Streaming Tool Calls**: Real-time updates as tools execute (e.g., "Scanning 50 documents...").
