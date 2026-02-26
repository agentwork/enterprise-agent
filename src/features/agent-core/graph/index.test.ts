import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { graph } from "./index"; // Adjust import path if needed

describe("Agent Graph", () => {
  it("should echo the human message", async () => {
    const initialState = {
      messages: [new HumanMessage("Hello, world!")],
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await graph.invoke(initialState) as any;
    const messages = result.messages;
    const lastMessage = messages[messages.length - 1];

    expect(lastMessage).toBeInstanceOf(AIMessage);
    expect(lastMessage.content).toContain("Echo: Hello, world!");
  });
});
