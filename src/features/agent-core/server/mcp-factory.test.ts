import { MCPClientFactory } from "./mcp-factory";
import { getMCPServers } from "@/features/admin/server/actions";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

// Mock external dependencies
jest.mock("@/features/admin/server/actions", () => ({
  getMCPServers: jest.fn(),
}));

jest.mock("@modelcontextprotocol/sdk/client/index.js", () => ({
  Client: jest.fn(),
}));

jest.mock("@modelcontextprotocol/sdk/client/stdio.js", () => ({
  StdioClientTransport: jest.fn(),
}));

describe("MCPClientFactory", () => {
  let mockConnect: jest.Mock;
  let mockListTools: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset singleton instance if possible, but since it's private static, 
    // we rely on state reset or just test behavior.
    // However, since it's a singleton, state persists across tests if not careful.
    // We can't easily reset private static property without ts-ignore.
    // @ts-ignore
    MCPClientFactory.instance = undefined;

    mockConnect = jest.fn().mockResolvedValue(undefined);
    mockListTools = jest.fn().mockResolvedValue({ tools: [] });

    (Client as unknown as jest.Mock).mockImplementation(() => ({
      connect: mockConnect,
      listTools: mockListTools,
      close: jest.fn(),
    }));

    (getMCPServers as jest.Mock).mockResolvedValue([
      {
        name: "test-server",
        command: "echo",
        args: ["hello"],
        env: {},
        isEnabled: true,
      },
    ]);
  });

  it("should return the same instance", () => {
    const instance1 = MCPClientFactory.getInstance();
    const instance2 = MCPClientFactory.getInstance();
    expect(instance1).toBe(instance2);
  });

  it("should initialize from DB and connect to servers", async () => {
    const instance = MCPClientFactory.getInstance();
    await instance.ensureInitialized();

    expect(getMCPServers).toHaveBeenCalled();
    expect(Client).toHaveBeenCalledWith(
        expect.objectContaining({ name: "EnterpriseAgent" }),
        expect.anything()
    );
    expect(mockConnect).toHaveBeenCalled();
  });

  it("should list tools from connected clients", async () => {
    const instance = MCPClientFactory.getInstance();
    
    // Mock tools return
    mockListTools.mockResolvedValue({
        tools: [{ name: "tool1", description: "desc", inputSchema: {} }]
    });

    await instance.ensureInitialized();
    const tools = await instance.listTools();

    expect(tools).toHaveLength(1);
    expect(tools[0].name).toBe("tool1");
  });
});
