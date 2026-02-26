# Local Supabase & Docker Setup Guide

This guide provides instructions on how to set up Supabase locally using Docker for the Enterprise Agent project.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) (ensure it's running)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/)

## 1. Install Supabase CLI

If you haven't installed the Supabase CLI yet, you can do so via npm or other package managers.

```bash
npm install -g supabase
```

Or on macOS via Homebrew:

```bash
brew install supabase/tap/supabase
```

## 2. Initialize Supabase

If the project is not yet initialized with Supabase config, run:

```bash
supabase init
```

*Note: This project already contains a `supabase/` directory with configuration.*

## 3. Start Supabase Services

Run the following command to start the local Supabase stack (Postgres, Auth, Storage, Edge Functions, Realtime, etc.):

```bash
supabase start
```

This will download the necessary Docker images and start the containers.
Once started, you will see output containing the API URL, Anon Key, Service Role Key, and Studio URL.

Example output:
```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
      JWT Secret: <your-jwt-secret>
        anon key: <your-anon-key>
service_role key: <your-service-role-key>
```

## 4. Environment Variables

Create a `.env.local` file in the root of the project (if not already present) and populate it with the values from the `supabase start` output.

```bash
# .env.local

# Supabase Public
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# Supabase Service Role (for server-side admin tasks)
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Database Connection String (for Drizzle ORM)
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

## 5. Apply Migrations

To apply the database schema to your local instance:

```bash
pnpm db:push
# or if using supabase migration files directly
supabase db reset
```

The project uses Drizzle ORM. You can generate and push migrations using:

```bash
pnpm db:generate
pnpm db:push
```

## 6. Accessing Supabase Studio

Open [http://127.0.0.1:54323](http://127.0.0.1:54323) in your browser to access the Supabase Studio dashboard. Here you can manage tables, auth users, and policies.

## 7. Stopping Services

To stop the local Supabase services:

```bash
supabase stop
```

## Troubleshooting

- **Docker not running**: Ensure Docker Desktop is started.
- **Port conflicts**: If ports 54321, 54322, etc. are in use, you can modify `supabase/config.toml` to change the ports.
- **Database connection failed**: Check your `DATABASE_URL` and ensure the container is running via `docker ps`.

## MCP Integration

The local Supabase instance can be used as an MCP tool. Ensure the `supabase-mcp` server is configured to point to your local instance URL and Key.
