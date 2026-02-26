import { searchKnowledge, createDocument } from "./actions";

export const knowledgeTools = [
  {
    name: "knowledge_search",
    description: "Search the knowledge base for information. Use this when the user asks a question that requires internal company knowledge, policies, or technical details.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query in natural language" },
        limit: { type: "number", description: "Maximum number of results to return (default: 5)" },
        threshold: { type: "number", description: "Similarity threshold (0-1, default: 0.5). Higher is stricter." },
      },
      required: ["query"],
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: async (args: any) => {
      return await searchKnowledge(args);
    },
  },
  {
    name: "knowledge_add_document",
    description: "Add a new document to the knowledge base. Use this when the user wants to store new information or policies.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Title of the document" },
        content: { type: "string", description: "Full text content of the document" },
        fileType: { type: "string", enum: ["text", "markdown", "pdf"], description: "Type of file" },
      },
      required: ["title", "content"],
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: async (args: any) => {
      return await createDocument(args);
    },
  },
];
