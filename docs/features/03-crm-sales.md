# Feature Specification: CRM & Sales Copilot

## 1. Overview
The **CRM & Sales Copilot** module is the primary operational interface for Account Managers. It enables users to manage client relationships, track deals, and log activities through natural language interactions, replacing tedious form-based data entry. It leverages the Agent Core to understand intent and MCP tools to interact with the database.

## 2. Target Audience
- **Account Managers**: Managing client portfolios and daily interactions.
- **Sales Directors**: Monitoring pipeline health and team performance.
- **Operations**: Ensuring data quality and consistency.

## 3. Key Functionality

### 3.1 Client Management
- **Description**: Centralized repository for client data, managed via chat.
- **Capabilities**:
    - **Natural Language Creation**: "Add a new client Nike, contact John Doe at john@nike.com".
    - **Smart Update**: "Update Nike's budget to $50k/month".
    - **Deduplication**: Automatically check for existing clients before creating new ones.

- **Key Flow (Create Client)**:
    1.  User says: "Add a new client Nike..."
    2.  Agent calls `search_clients(name="Nike")` to check existence.
    3.  If not found, Agent calls `create_client(name="Nike", contact_info=...)`.
    4.  Database confirms creation.
    5.  Agent responds with a summary and renders a `<ClientCard />` UI.

### 3.2 Activity Logging
- **Description**: Effortless tracking of interactions and meetings.
- **Capabilities**:
    - **Meeting Summaries**: "Just had a call with Nike about Q3 strategy. They want to focus on video ads." -> Logs a meeting note.
    - **Follow-up Reminders**: "Remind me to email John next Tuesday." -> Creates a task.
    - **Sentiment Analysis**: Automatically tag interaction sentiment (Positive, Neutral, Negative).

- **Key Flow (Log Activity)**:
    1.  User inputs meeting notes.
    2.  Agent identifies the client ("Nike") and the action ("Log meeting").
    3.  Agent calls `log_activity(client_id=..., type="meeting", notes=...)`.
    4.  System analyzes sentiment and tags it.
    5.  Activity is added to the client's timeline.

### 3.3 Deal Pipeline
- **Description**: Visualizing and managing sales opportunities.
- **Capabilities**:
    - **Kanban Board**: Drag-and-drop deals (Generative UI).
    - **Forecast**: AI-predicted close probability based on activity history.

## 4. Data & Schema
- **Database Tables**:
    - `clients`:
        - `id`: UUID
        - `name`: Text
        - `industry`: Text
        - `owner_id`: UUID (FK to auth.users)
        - `created_at`: Timestamp
    - `contacts`:
        - `id`: UUID
        - `client_id`: UUID
        - `name`: Text
        - `email`: Text
        - `role`: Text
    - `deals`:
        - `id`: UUID
        - `client_id`: UUID
        - `stage`: Enum ('lead', 'negotiation', 'closed-won', 'closed-lost')
        - `amount`: Decimal
        - `close_date`: Date
    - `activities`:
        - `id`: UUID
        - `client_id`: UUID
        - `type`: Enum ('call', 'meeting', 'email', 'note')
        - `content`: Text
        - `sentiment`: Text

## 5. Integration Points
- **Input**: Chat Interface (Agent Core), Manual Entry (optional).
- **Output**: Generative UI Components (`<ClientCard />`, `<ActivityFeed />`, `<DealKanban />`).
- **External**: LinkedIn Enrichment (Planned via MCP), Email Sync (Planned).

## 6. User Scenarios
- **Scenario A**: Quick Client Lookup.
    - User: "Show me the last 3 interactions with Adidas."
    - Agent: Queries `activities` table via MCP.
    - Agent: Returns a list of recent calls and emails.
    - UI: Renders an interactive `<Timeline />` component.

- **Scenario B**: New Deal Entry.
    - User: "Create a deal for Adidas Q4 Campaign worth $100k."
    - Agent: Checks if client "Adidas" exists.
    - Agent: Creates a new deal record linked to Adidas.
    - Agent: Confirms creation with a `<DealCard />`.

## 7. Future Roadmap
- **Email Integration**: Automatically log emails sent/received via Gmail/Outlook MCP.
- **Voice Input**: Dictate meeting notes directly to the CRM via mobile app.
- **Competitor Analysis**: Automatically pull competitor info when creating a new client.
