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
  const messages = result.messages.map((msg: any) => {
    // Check if msg has _getType method (LangChain message object)
    // Or if it's a plain object that might have type property
    const type = typeof msg._getType === 'function' 
      ? msg._getType() 
      : (msg.type || (msg.id ? msg.id[msg.id.length - 1] : "unknown"));
      
    return {
      type,
      content: msg.content,
      tool_calls: msg.tool_calls || [],
      tool_outputs: msg.tool_outputs || [],
    };
  });

  return { messages };
}
