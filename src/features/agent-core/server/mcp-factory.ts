import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { getMCPServers } from "@/features/admin/server/actions";

// This factory manages MCP client connections.
// It acts as a unified interface for the Agent to access tools from multiple MCP servers.

export class MCPClientFactory {
  private static instance: MCPClientFactory;
  private clients: Map<string, Client>;

  private toolCache: Map<string, string>; // toolName -> clientName
  private isInitialized = false;

  private constructor() {
    this.clients = new Map();
    this.toolCache = new Map();
  }

  public static getInstance(): MCPClientFactory {
    if (!MCPClientFactory.instance) {
      MCPClientFactory.instance = new MCPClientFactory();
    }
    return MCPClientFactory.instance;
  }

  /**
   * Initializes connections to all enabled MCP servers from the database.
   */
  public async ensureInitialized() {
    if (this.isInitialized) return;

    try {
      const servers = await getMCPServers();
      for (const server of servers) {
        if (server.isEnabled && !this.clients.has(server.name)) {
          try {
            await this.createStdioClient(
              server.name,
              server.command,
              server.args || [],
              server.env || {}
            );
          } catch (error) {
            console.error(`Failed to initialize MCP server ${server.name}:`, error);
          }
        }
      }
      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to load MCP servers from DB:", error);
    }
  }

  /**
   * Connects to an MCP server via Stdio transport.
   */
  public async createStdioClient(
    name: string,
    command: string,
    args: string[] = [],
    env: Record<string, string> = {}
  ): Promise<Client> {
    if (this.clients.has(name)) {
      return this.clients.get(name)!;
    }

    const transport = new StdioClientTransport({
      command,
      args,
      env: { ...process.env, ...env },
    });

    const client = new Client(
      {
        name: "EnterpriseAgent",
        version: "1.0.0",
      },
      {
        capabilities: {
          sampling: {},
        },
      }
    );

    try {
      await client.connect(transport);
      this.clients.set(name, client);
      console.log(`[MCP] Connected to ${name}`);
      
      // Refresh tool cache
      await this.refreshToolCache(name);
      
      return client;
    } catch (error) {
      console.error(`[MCP] Failed to connect to ${name}:`, error);
      throw error;
    }
  }

  private async refreshToolCache(clientName: string) {
    const client = this.clients.get(clientName);
    if (!client) return;

    try {
      const result = await client.listTools();
      result.tools.forEach(tool => {
        this.toolCache.set(tool.name, clientName);
      });
    } catch (error) {
       console.error(`[MCP] Failed to list tools for cache from ${clientName}:`, error);
    }
  }

  public getClient(name: string): Client | undefined {
    return this.clients.get(name);
  }

  /**
   * Lists all available tools from all connected MCP clients.
   * Returns a list of tools with their source client name added to metadata if needed.
   */
  public async listTools(): Promise<Tool[]> {
    await this.ensureInitialized();

    const allTools: Tool[] = [];

    for (const [clientName, client] of this.clients.entries()) {
      try {
        const result = await client.listTools();
        // Update cache while we are at it
        result.tools.forEach(tool => this.toolCache.set(tool.name, clientName));
        allTools.push(...result.tools);
      } catch (error) {
        console.error(`[MCP] Error listing tools from ${clientName}:`, error);
      }
    }

    return allTools;
  }

  public async callTool(
    name: string,
    args: Record<string, unknown>
  ): Promise<unknown> {
    await this.ensureInitialized();

    // 1. Check cache first
    let clientName = this.toolCache.get(name);
    
    // 2. If not in cache, try to refresh all
    if (!clientName) {
        await this.listTools();
        clientName = this.toolCache.get(name);
    }

    if (!clientName) {
        throw new Error(`Tool '${name}' not found in any connected MCP client.`);
    }

    const client = this.clients.get(clientName);
    if (!client) {
         throw new Error(`Client '${clientName}' for tool '${name}' is not connected.`);
    }

    return await client.callTool({
        name,
        arguments: args,
    });
  }

  public async closeAll() {
    for (const [name, client] of this.clients.entries()) {
      try {
        await client.close();
        console.log(`[MCP] Closed connection to ${name}`);
      } catch (error) {
        console.error(`[MCP] Error closing connection to ${name}:`, error);
      }
    }
    this.clients.clear();
    this.toolCache.clear();
    this.isInitialized = false;
  }
}
