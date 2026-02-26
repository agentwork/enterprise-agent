import { getMCPToolsForModel, executeTools } from "./tools";
import { MCPClientFactory } from "../server/mcp-factory";
import { AIMessage } from "@langchain/core/messages";

// Mock MCPClientFactory
jest.mock("../server/mcp-factory");

describe("MCP Tools Logic", () => {
  let mockListTools: jest.Mock;
  let mockCallTool: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockListTools = jest.fn().mockResolvedValue([
      {
        name: "weather_tool",
        description: "Get weather",
        inputSchema: {
          type: "object",
          properties: {
            city: { type: "string" },
          },
        },
      },
    ]);

    mockCallTool = jest.fn().mockResolvedValue({ temperature: 25, unit: "C" });

    (MCPClientFactory.getInstance as jest.Mock).mockReturnValue({
      listTools: mockListTools,
      callTool: mockCallTool,
    });
  });

  describe("getMCPToolsForModel", () => {
    it("should fetch tools and convert to OpenAI format", async () => {
      const tools = await getMCPToolsForModel();

      expect(mockListTools).toHaveBeenCalled();
      expect(tools).toHaveLength(1);
      expect(tools[0]).toEqual({
        type: "function",
        function: {
          name: "weather_tool",
          description: "Get weather",
          parameters: {
            type: "object",
            properties: {
              city: { type: "string" },
            },
          },
        },
      });
    });
  });

  describe("executeTools", () => {
    it("should return empty array if no tool calls", async () => {
      const message = new AIMessage({ content: "Hello" });
      const results = await executeTools(message);
      expect(results).toEqual([]);
      expect(mockCallTool).not.toHaveBeenCalled();
    });

    it("should execute tool calls and return ToolMessages", async () => {
      const message = new AIMessage({
        content: "",
        tool_calls: [
          {
            name: "weather_tool",
            args: { city: "Taipei" },
            id: "call_123",
            type: "tool_call"
          },
        ],
      });

      const results = await executeTools(message);

      expect(mockCallTool).toHaveBeenCalledWith("weather_tool", { city: "Taipei" });
      expect(results).toHaveLength(1);
      expect(results[0].content).toBe(JSON.stringify({ temperature: 25, unit: "C" }));
      expect(results[0].tool_call_id).toBe("call_123");
    });

    it("should handle errors gracefully", async () => {
      mockCallTool.mockRejectedValue(new Error("Network error"));

      const message = new AIMessage({
        content: "",
        tool_calls: [
          {
            name: "weather_tool",
            args: { city: "ErrorCity" },
            id: "call_456",
            type: "tool_call"
          },
        ],
      });

      const results = await executeTools(message);

      expect(mockCallTool).toHaveBeenCalled();
      expect(results).toHaveLength(1);
      expect(results[0].content).toContain("Error executing tool weather_tool: Network error");
      // Some LangChain versions support status: "error", check if property exists
      // expect(results[0].status).toBe("error"); 
    });
  });
});
