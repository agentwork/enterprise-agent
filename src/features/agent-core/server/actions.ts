"use server";

import { runner } from "./runner";
import { HumanMessage } from "@langchain/core/messages";

export async function invokeAgent(
  input: string,
  threadId: string
) {
  const config = {
    configurable: {
      thread_id: threadId,
    },
  };

  const result = (await runner.invoke(
    {
      messages: [new HumanMessage(input)],
    },
    config
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  )) as { messages: any[] };

  // Convert LangChain messages to a serializable format for the client
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages = result.messages.map((msg: any) => ({
    type: msg._getType(),
    content: msg.content,
    tool_calls: msg.tool_calls || [],
    tool_outputs: msg.tool_outputs || [],
  }));

  return { messages };
}
