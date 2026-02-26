import { MCPClientFactory } from "../server/mcp-factory";
import { ToolMessage } from "@langchain/core/messages";
import { AIMessage } from "@langchain/core/messages";

/**
 * Fetches tools from MCP and converts them to the specified provider's format.
 */
export async function getMCPToolsForModel(provider: "openai" | "anthropic" = "openai") {
  const mcp = MCPClientFactory.getInstance();
  // Ensure we have the latest tools
  const tools = await mcp.listTools();
  
  if (provider === "anthropic") {
    // Convert to Anthropic tool format
    return tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.inputSchema,
    }));
  }

  // Default: Convert to OpenAI tool format
  return tools.map((tool) => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    },
  }));
}

/**
 * Executes tool calls found in the last AI message using the MCPClientFactory.
 */
export async function executeTools(lastMessage: AIMessage) {
  const toolCalls = lastMessage.tool_calls;
  if (!toolCalls || toolCalls.length === 0) {
    return [];
  }

  const mcp = MCPClientFactory.getInstance();
  const results = [];

  for (const call of toolCalls) {
    try {
      // call.args is typically an object if parsed correctly by LangChain
      const result = await mcp.callTool(call.name, call.args as Record<string, unknown>);
      
      // MCP returns { content: ... } or similar. 
      // We stringify the result to pass it back to the model.
      // Ideally we might want to format it better depending on the content type,
      // but JSON.stringify is a safe default for the raw result.
      results.push(
        new ToolMessage({
          tool_call_id: call.id!,
          content: JSON.stringify(result),
          name: call.name,
        })
      );
    } catch (error) {
      console.error(`Error executing tool ${call.name}:`, error);
      results.push(
        new ToolMessage({
          tool_call_id: call.id!,
          content: `Error executing tool ${call.name}: ${error instanceof Error ? error.message : String(error)}`,
          name: call.name,
          status: "error", // Optional, supported in some LangChain versions
        })
      );
    }
  }

  return results;
}
