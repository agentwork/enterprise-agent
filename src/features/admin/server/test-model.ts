"use server";

import { getModel } from "@/features/agent-core/server/model-factory";
import { HumanMessage } from "@langchain/core/messages";

export async function testModelConnection(input: string) {
  try {
    const { model } = await getModel();
    const response = await model.invoke([new HumanMessage(input)]);
    
    return {
      success: true,
      response: response.content as string,
    };
  } catch (error) {
    console.error("Failed to test model connection:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
