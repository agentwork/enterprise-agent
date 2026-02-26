import { StateGraph } from "@langchain/langgraph";
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { AgentState } from "./state";

// 1. Define nodes
const agentNode = async (state: AgentState): Promise<Partial<AgentState>> => {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1];

  // Placeholder logic for now
  if (lastMessage instanceof HumanMessage) {
    return {
      messages: [new AIMessage({ content: `Echo: ${lastMessage.content}` })],
    };
  }

  return {};
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
  .addEdge("__start__", "agent")
  .addEdge("agent", "__end__");

export const graph = workflow.compile();
