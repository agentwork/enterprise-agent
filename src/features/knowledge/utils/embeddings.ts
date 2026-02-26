import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const embeddings = new OpenAIEmbeddings({
  modelName: "text-embedding-3-small",
  dimensions: 1536,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  // OpenAI recommends replacing newlines with spaces for best results
  const cleanedText = text.replace(/\n/g, " ");
  return await embeddings.embedQuery(cleanedText);
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
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
