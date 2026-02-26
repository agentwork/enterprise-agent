"use server";

import { invokeAgent } from "@/features/agent-core/server/actions";
import { getClient } from "@/features/crm/server/actions";

interface GenerateSectionInput {
  clientId: string;
  sectionTitle: string;
  sectionType: string;
  userPrompt?: string;
  proposalId: string;
}

export async function generateSectionContent({
  clientId,
  sectionTitle,
  sectionType,
  userPrompt,
  proposalId,
}: GenerateSectionInput) {
  try {
    // 1. Fetch basic client info to context (optional, but good for prompt)
    const clientResult = await getClient(clientId);
    const clientName = clientResult.success && clientResult.data ? clientResult.data.name : "the client";

    // 2. Construct the prompt
    const systemPrompt = `
You are an expert Proposal Generator.
Your task is to generate content for a specific section of a business proposal.

Context:
- Client: ${clientName} (ID: ${clientId})
- Section Title: ${sectionTitle}
- Section Type: ${sectionType}
- Additional Instructions: ${userPrompt || "None"}

Instructions:
1. Use your tools to look up relevant details about the client (CRM) or similar past proposals/documents (Knowledge Base) if necessary.
2. Generate professional, persuasive content for this section.
3. Return ONLY the content for the section. Do not include conversational filler like "Here is the content:".
4. If the section type is "list", format the output as a bulleted list.
5. If the section type is "text", use paragraphs.
6. If the section type is "table", output a JSON array of objects representing rows. Each object key is a column header. Do NOT wrap in markdown code blocks.
`;

    // 3. Invoke the agent
    // We use a specific thread for this generation to keep it isolated or consistent
    const threadId = `proposal-gen-${proposalId}-${Date.now()}`;
    
    const result = await invokeAgent(systemPrompt, threadId);
    
    // 4. Extract the last message content
    const messages = result.messages;
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage && lastMessage.content) {
      // Clean up potential artifacts
      const content = lastMessage.content;
      
      // If type is list, we might want to split it into an array
      if (sectionType === "list") {
        // Simple heuristic to split lines if it looks like a list
        const lines = content.split("\n").filter((l: string) => l.trim().length > 0);
        const cleanLines = lines.map((l: string) => l.replace(/^[-*•\d\.]+\s+/, "").trim());
        return { success: true, data: cleanLines };
      }

      if (sectionType === "table") {
        try {
            // Clean markdown code blocks if present
            const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
            const tableData = JSON.parse(cleanContent);
            if (Array.isArray(tableData)) {
                return { success: true, data: tableData };
            }
        } catch (e) {
            console.error("Failed to parse table JSON:", e);
             // Fallback to text if parsing fails
        }
      }

      return { success: true, data: content };
    }

    return { success: false, error: "No content generated" };
  } catch (error) {
    console.error("Failed to generate section content:", error);
    return { success: false, error: "Failed to generate content" };
  }
}
