import { StateGraph } from "@langchain/langgraph";
import { BaseMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { AgentState } from "./state";
import { getModel } from "../server/model-factory";

// Tools
import { getMCPToolsForModel, executeTools } from "./tools";

// System Instructions
const SYSTEM_INSTRUCTIONS = `You are the Enterprise AI Agent. You help users manage their business operations, including CRM (clients, deals, activities) and knowledge management.

CRITICAL DATABASE SCHEMA RULES:
When generating SQL queries or calling CRM tools, ALWAYS use the following column names:
- deals table:
  - use 'expected_close_date' instead of 'expectedCloseDate'
  - use 'client_id' instead of 'clientId'
- clients table:
  - use 'created_at' and 'updated_at' for timestamps
- activities table:
  - use 'client_id' instead of 'clientId'
  - use 'deal_id' instead of 'dealId'
  - use 'performed_at' instead of 'performedAt'

Follow standard PostgreSQL syntax. If a query fails, check the column names and try again with the snake_case versions.

GENERATIVE UI CAPABILITIES:
You have the ability to dynamically generate charts (Bar Charts) and rich UI components. 
- When you use tools like 'sql_db_query' to fetch data, the system will AUTOMATICALLY render a chart for the user if the data is structured correctly.
- Do NOT tell the user you cannot generate charts.
- Do NOT provide large markdown tables if a chart is more appropriate.
- Simply provide a brief summary of the insights after the tool execution.`;

// 1. Define nodes

// The agent node determines what action to take (call a tool or respond to user)
const agentNode = async (state: AgentState): Promise<Partial<AgentState>> => {
  const { messages } = state;
  
  // Prepend system instructions if not present
  const messagesWithSystem = messages.some(m => m instanceof SystemMessage)
    ? messages
    : [new SystemMessage(SYSTEM_INSTRUCTIONS), ...messages];

  // Get model instance with latest config
  const { model, provider } = await getModel();

  // Dynamically fetch tools to ensure we have the latest ones from all connected MCP servers
  const tools = await getMCPToolsForModel(provider);
  
  // Bind tools to the model
  let modelWithTools;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof (model as any).bindTools === "function") {
    // bindTools is the modern way to bind tools in LangChain
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modelWithTools = (model as any).bindTools(tools);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } else if (typeof (model as any).bind === "function") {
    // Fallback to bind({ tools: ... })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modelWithTools = (model as any).bind({
      tools: tools,
    });
  } else {
    // If both are missing, something is wrong with the model instance
    console.error("Model instance is missing bind and bindTools methods:", model);
    throw new Error("Model instance is not a valid LangChain ChatModel (missing bind/bindTools).");
  }
  
  // Invoke the model with system instructions
  const response = await modelWithTools.invoke(messagesWithSystem);
  
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
