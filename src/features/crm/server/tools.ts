import { createClient, createDeal, createActivity, getClients, getClient } from "./actions";

// Helper to convert Zod schema to JSON schema (simplified)
// Since we don't have zod-to-json-schema installed, we'll define them manually or use a helper if possible.
// For now, manual definition is safer to avoid dependency issues.

export const crmTools = [
  {
    name: "crm_create_client",
    description: "Create a new client in the CRM. Use this when the user wants to add a new company or client.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Name of the client company" },
        industry: { type: "string", description: "Industry of the client" },
        description: { type: "string", description: "Brief description" },
        website: { type: "string", description: "Website URL" },
      },
      required: ["name"],
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: async (args: any) => {
      return await createClient(args);
    },
  },
  {
    name: "crm_create_deal",
    description: "Create a new deal (opportunity) for a client.",
    inputSchema: {
      type: "object",
      properties: {
        clientId: { type: "string", description: "UUID of the client" },
        title: { type: "string", description: "Title of the deal" },
        amount: { type: "number", description: "Value of the deal" },
        stage: { 
          type: "string", 
          enum: ["lead", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"],
          description: "Current stage of the deal"
        },
        probability: { type: "number", description: "Probability of closing (0-100)" },
        expectedCloseDate: { type: "string", description: "Expected close date (ISO string)" },
      },
      required: ["clientId", "title"],
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: async (args: any) => {
      return await createDeal(args);
    },
  },
  {
    name: "crm_log_activity",
    description: "Log an activity (note, call, meeting, etc.) for a client or deal.",
    inputSchema: {
      type: "object",
      properties: {
        clientId: { type: "string", description: "UUID of the client (optional if dealId is provided)" },
        dealId: { type: "string", description: "UUID of the deal (optional if clientId is provided)" },
        type: { 
          type: "string", 
          enum: ["note", "call", "meeting", "email", "task"],
          description: "Type of activity"
        },
        content: { type: "string", description: "Content/notes of the activity" },
        sentiment: { type: "string", enum: ["positive", "neutral", "negative"], description: "Sentiment of the interaction" },
        performedAt: { type: "string", description: "When the activity happened (ISO string)" },
      },
      required: ["type", "content"],
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: async (args: any) => {
      return await createActivity(args);
    },
  },
  {
    name: "crm_get_clients",
    description: "List all clients in the CRM. Use to find a client's ID or see recent clients.",
    inputSchema: {
      type: "object",
      properties: {},
    },
    handler: async () => {
      return await getClients();
    },
  },
  {
    name: "crm_search_client",
    description: "Get details of a specific client by ID.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "UUID of the client" },
      },
      required: ["id"],
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: async (args: any) => {
      return await getClient(args.id);
    },
  },
];
