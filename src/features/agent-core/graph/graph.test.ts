import { graph } from "./index";
import { MCPClientFactory } from "../server/mcp-factory";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

// Mock MCPClientFactory
jest.mock("../server/mcp-factory");

describe("Agent Graph", () => {
  let mockListTools: jest.Mock;
  let mockCallTool: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    mockListTools = jest.fn().mockResolvedValue([
      {
        name: "test-tool",
        description: "A test tool",
        inputSchema: {
          type: "object",
          properties: {
            arg: { type: "string" },
          },
        },
      },
    ]);

    mockCallTool = jest.fn().mockResolvedValue({ content: "Tool result" });

    (MCPClientFactory.getInstance as jest.Mock).mockReturnValue({
      listTools: mockListTools,
      callTool: mockCallTool,
    });
  });

  it("should compile the graph", () => {
    expect(graph).toBeDefined();
  });

  // Note: We cannot easily test the full execution flow without mocking ChatOpenAI
  // and the entire LangGraph runtime, which is complex.
  // But we can verify the graph structure has the expected nodes.
  
  // Accessing private properties of CompiledGraph is not standard, 
  // but we can check if it runs with a mock LLM if we inject it.
  // Since we hardcoded ChatOpenAI in index.ts, we can't inject a mock easily.
  // A better design would be to accept the model as a parameter, 
  // but for now we just verify compilation.
});
