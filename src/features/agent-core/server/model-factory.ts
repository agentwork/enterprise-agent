import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { getSystemSetting } from "@/features/admin/server/actions";

export const getModel = async () => {
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
