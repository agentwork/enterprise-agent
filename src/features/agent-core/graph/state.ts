import { BaseMessage } from "@langchain/core/messages";

export interface AgentState {
  messages: BaseMessage[];
  // Additional state properties will be added here as needed
  // e.g., currentTool, userId, etc.
}
