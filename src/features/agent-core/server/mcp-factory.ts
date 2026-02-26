import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// This factory manages MCP client connections.
// In a real implementation, it would likely handle multiple transports and clients.

export class MCPClientFactory {
  private static instance: MCPClientFactory;
  private clients: Map<string, Client>;

  private constructor() {
    this.clients = new Map();
  }

  public static getInstance(): MCPClientFactory {
    if (!MCPClientFactory.instance) {
      MCPClientFactory.instance = new MCPClientFactory();
    }
    return MCPClientFactory.instance;
  }

  public async createStdioClient(
    name: string,
    command: string,
    args: string[] = []
  ): Promise<Client> {
    if (this.clients.has(name)) {
      return this.clients.get(name)!;
    }

    const transport = new StdioClientTransport({
      command,
      args,
    });

    const client = new Client(
      {
        name: "EnterpriseAgent",
        version: "1.0.0",
      },
      {
        capabilities: {
          // Client capabilities
          sampling: {},
        },
      }
    );

    await client.connect(transport);
    this.clients.set(name, client);
    return client;
  }

  public getClient(name: string): Client | undefined {
    return this.clients.get(name);
  }
}
