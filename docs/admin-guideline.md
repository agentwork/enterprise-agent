# Admin Guideline & System Operations

This document provides a comprehensive guide for system administrators to configure the Enterprise Agent (EA) platform, manage MCP servers, and set up local development environments.

## Table of Contents

1. [Admin Panel Overview](#admin-panel-overview)
2. [System Configuration](#system-configuration)
   - [LLM Settings](#llm-settings)
   - [MCP Server Management](#mcp-server-management)
3. [Local Supabase MCP Setup](#local-supabase-mcp-setup)
4. [Model API Key Application](#model-api-key-application)

---

## Admin Panel Overview

The Admin Panel is the central control hub for the Enterprise Agent. It is accessible only to users with the `admin` role.

- **URL**: `/admin`
- **Key Features**:
  - System Settings (LLM Provider, Model Name, API Keys)
  - MCP Server Management (Add, Edit, Delete, Enable/Disable)
  - User Management (Planned)

### Accessing the Admin Panel
1. Log in with an account that has the `admin` role.
2. Navigate to `http://localhost:3000/admin`.
3. You will see the dashboard overview.
4. Click on **Settings** in the sidebar to configure the system.

---

## System Configuration

### LLM Settings

To enable the AI Agent, you must configure the Large Language Model (LLM) settings.

1. Navigate to `/admin/settings`.
2. Locate the **LLM Configuration** section.
3. **Provider**: Currently supports `OpenAI` and `Anthropic` (via LangChain).
4. **Model Name**: Enter the model ID (e.g., `gpt-4o`, `claude-3-5-sonnet-20240620`).
5. **API Key**: Enter your secret API key.
6. Click **Save Settings**.

### MCP Server Management

The Model Context Protocol (MCP) allows the agent to connect to external tools and data sources.

1. Navigate to `/admin/settings`.
2. Locate the **MCP Servers** section.
3. **Add a New Server**:
   - **Name**: A unique identifier (e.g., `supabase-local`, `filesystem`).
   - **Command**: The executable to run (e.g., `npx`, `uv`, `python`).
   - **Args**: Arguments for the command (e.g., `-y @modelcontextprotocol/server-supabase`).
   - **Env**: Environment variables required by the server (JSON format).
     ```json
     {
       "SUPABASE_URL": "...",
       "SUPABASE_KEY": "..."
     }
     ```
4. **Toggle Status**: Use the switch to Enable/Disable a server without deleting it.
5. **Delete**: Remove a server configuration permanently.

---

## Local Supabase MCP Setup

To test the agent with real database data, you can set up a local Supabase MCP server. This allows the agent to query your local Supabase instance using natural language.

### Prerequisites
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed (`brew install supabase/tap/supabase`).
- Docker running.
- Node.js installed.

### Step-by-Step Guide

#### 1. Start Local Supabase
If you haven't already started the local Supabase instance for this project:

```bash
npx supabase start
```

This will output the API URL and Service Role Key. Keep these handy.

#### 2. Verify Database Schema
Ensure your local database has the required tables. You can push the schema using Drizzle:

```bash
npm run db:push
```

#### 3. Configure in Admin Panel
Now, add the Supabase MCP server to the Enterprise Agent via the Admin UI.

1. Go to `/admin/settings`.
2. Add a new MCP Server with the following details:
   - **Name**: `supabase-local`
   - **Command**: `npx`
   - **Args**:
     ```
     -y
     @modelcontextprotocol/server-supabase
     ```
     *(Note: Enter each argument on a new line if the UI supports it, or as a JSON array if editing raw config)*
   - **Env**:
     ```json
     {
       "SUPABASE_URL": "http://127.0.0.1:54321",
       "SUPABASE_SERVICE_ROLE_KEY": "<your_service_role_key>"
     }
     ```
     *(Replace `<your_service_role_key>` with the key from `npx supabase status`)*

3. Click **Save**.
4. The Agent will now be able to use tools like `query_database` to inspect your local data.

---

## Model API Key Application

To use the Enterprise Agent, you need valid API keys for the underlying LLMs.

### OpenAI (GPT-4o)
1. Visit the [OpenAI Platform](https://platform.openai.com/).
2. Sign up or Log in.
3. Go to **Settings** > **API Keys** (or [Direct Link](https://platform.openai.com/api-keys)).
4. Click **Create new secret key**.
5. Name it (e.g., "Enterprise Agent Dev").
6. Copy the key immediately (you won't see it again).
7. Paste it into the Admin Panel.

### Anthropic (Claude 3.5 Sonnet)
1. Visit the [Anthropic Console](https://console.anthropic.com/).
2. Sign up or Log in.
3. Go to **Settings** > **API Keys** (or [Direct Link](https://console.anthropic.com/settings/keys)).
4. Click **Create Key**.
5. Name it (e.g., "Enterprise Agent Dev").
6. Copy the key.
7. Paste it into the Admin Panel.

---

**Note**: Ensure you have billing set up on these platforms, as API usage is not free.
