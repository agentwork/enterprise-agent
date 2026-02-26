import { MCPClientFactory } from "./mcp-factory";

describe("MCPClientFactory", () => {
  it("should return the same instance", () => {
    const instance1 = MCPClientFactory.getInstance();
    const instance2 = MCPClientFactory.getInstance();
    expect(instance1).toBe(instance2);
  });

  // We can't easily test createStdioClient without mocking the SDK or having a real server.
  // But we can verify the method exists.
  it("should have createStdioClient method", () => {
    const instance = MCPClientFactory.getInstance();
    expect(typeof instance.createStdioClient).toBe("function");
  });
});
