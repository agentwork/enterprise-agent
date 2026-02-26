import { StateGraph } from "@langchain/langgraph";
import { BaseMessage, AIMessage } from "@langchain/core/messages";
import { AgentState } from "./state";
import { getModel } from "../server/model-factory";

// Tools
import { getMCPToolsForModel, executeTools } from "./tools";

// 1. Define nodes

// The agent node determines what action to take (call a tool or respond to user)
const agentNode = async (state: AgentState): Promise<Partial<AgentState>> => {
  const { messages } = state;
  
  // Get model instance with latest config
  const { model, provider } = await getModel();

  // Dynamically fetch tools to ensure we have the latest ones from all connected MCP servers
  const tools = await getMCPToolsForModel(provider);
  
  // Bind tools to the model
  // We use bindTools if available, or bind({ tools: ... })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
