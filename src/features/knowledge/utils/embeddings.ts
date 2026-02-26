import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getSystemSetting } from "@/features/admin/server/actions";

async function getEmbeddingsInstance() {
  const apiKeySetting = await getSystemSetting("llm_api_key");
  const apiKey = (apiKeySetting?.value as string) || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing OpenAI API Key. Please set it in Admin Settings or OPENAI_API_KEY environment variable."
    );
  }

  return new OpenAIEmbeddings({
    modelName: "text-embedding-3-small",
    dimensions: 1536,
    apiKey,
  });
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const embeddings = await getEmbeddingsInstance();
  // OpenAI recommends replacing newlines with spaces for best results
  const cleanedText = text.replace(/\n/g, " ");
  return await embeddings.embedQuery(cleanedText);
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings = await getEmbeddingsInstance();
  const cleanedTexts = texts.map((t) => t.replace(/\n/g, " "));
  return await embeddings.embedDocuments(cleanedTexts);
}

export async function splitText(
  text: string,
  chunkSize: number = 1000,
  chunkOverlap: number = 200
): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
  });

  return await splitter.splitText(text);
}
