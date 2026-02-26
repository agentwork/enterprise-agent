import { StateGraph } from "@langchain/langgraph";
import { BaseMessage, AIMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { AgentState } from "./state";
import { getSystemSetting } from "@/features/admin/server/actions";

// Tools
import { getMCPToolsForModel, executeTools } from "./tools";

// Initialize model dynamically
const getModel = async () => {
  const providerSetting = await getSystemSetting("llm_provider");
  const modelNameSetting = await getSystemSetting("llm_model_name");
  const apiKeySetting = await getSystemSetting("llm_api_key");
  
  const provider = (providerSetting?.value as string) || "openai";
  const modelName = (modelNameSetting?.value as string) || "gpt-4o";
  const apiKey = (apiKeySetting?.value as string);

  if (provider === "anthropic") {
    return {
      model: new ChatAnthropic({
        modelName: modelName,
        apiKey: apiKey, // If undefined, it falls back to process.env.ANTHROPIC_API_KEY
        temperature: 0,
      }),
      provider: "anthropic" as const
    };
  }

  return {
    model: new ChatOpenAI({
      modelName: modelName,
      apiKey: apiKey, // If undefined, it falls back to process.env.OPENAI_API_KEY
      temperature: 0,
    }),
    provider: "openai" as const
  };
};

// 1. Define nodes

// The agent node determines what action to take (call a tool or respond to user)
const agentNode = async (state: AgentState): Promise<Partial<AgentState>> => {
  const { messages } = state;
  
  // Get model instance with latest config
  const { model, provider } = await getModel();

  // Dynamically fetch tools to ensure we have the latest ones from all connected MCP servers
  const tools = await getMCPToolsForModel(provider);
  
  // Bind tools to the model
  // We use bind({ tools: ... }) directly because we have the raw tool definitions
  // derived from MCP schemas.
  const modelWithTools = (model as any).bind({
    tools: tools,
  });
  
  // Invoke the model
  const response = await modelWithTools.invoke(messages);
  
  return {
    messages: [response],
  };
};

// The tools node executes the tools requested by the agent
const toolsNode = async (state: AgentState): Promise<Partial<AgentState>> => {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1] as AIMessage;
  
  // Execute tools using MCPClientFactory
  const toolMessages = await executeTools(lastMessage);
  
  return {
    messages: toolMessages,
  };
};

// 2. Define conditional edge logic
const shouldContinue = (state: AgentState) => {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1] as AIMessage;
  
  // If the LLM made tool calls, go to the "tools" node
  if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
    return "tools";
  }
  
  // Otherwise, stop (respond to user)
  return "__end__";
};

// 3. Compile the graph
export const workflow = new StateGraph<AgentState>({
  channels: {
    messages: {
      reducer: (a: BaseMessage[], b: BaseMessage[]) => a.concat(b),
      default: () => [],
    },
  },
})
  .addNode("agent", agentNode)
  .addNode("tools", toolsNode)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tools", "agent");

export const graph = workflow.compile();
