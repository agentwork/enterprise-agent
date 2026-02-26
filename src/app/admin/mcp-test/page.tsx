import { MCPTestForm } from "@/features/admin/components/mcp-test-form";

export default function MCPTestPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">MCP Connection Test</h1>
        <p className="text-muted-foreground">
          Test connections to your local Supabase MCP server and other registered MCP servers.
        </p>
      </div>
      
      <div className="max-w-3xl">
        <MCPTestForm />
      </div>
    </div>
  );
}
