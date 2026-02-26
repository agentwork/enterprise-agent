"use server";

import { MCPClientFactory } from "@/features/agent-core/server/mcp-factory";

export async function testMCPConnection() {
  try {
    const mcp = MCPClientFactory.getInstance();
    await mcp.ensureInitialized();
    const tools = await mcp.listTools();
    
    return {
      success: true,
      tools: tools.map(t => ({
        name: t.name,
        description: t.description,
      })),
    };
  } catch (error) {
    console.error("Failed to test MCP connection:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function callMCPTool(toolName: string, args: Record<string, unknown>) {
  try {
    const mcp = MCPClientFactory.getInstance();
    const result = await mcp.callTool(toolName, args);
    return {
      success: true,
      result,
    };
  } catch (error) {
    console.error(`Failed to call MCP tool ${toolName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
