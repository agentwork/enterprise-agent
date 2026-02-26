import { z } from "zod";

export const CreateClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  industry: z.string().optional(),
  description: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export const UpdateClientSchema = CreateClientSchema.partial().extend({
  id: z.string().uuid("Invalid ID"),
});

export type CreateClientInput = z.infer<typeof CreateClientSchema>;
export type UpdateClientInput = z.infer<typeof UpdateClientSchema>;

export const CreateDealSchema = z.object({
  clientId: z.string().uuid("Client ID is required"),
  title: z.string().min(1, "Title is required"),
  amount: z.coerce.number().optional(),
  stage: z.enum([
    "lead",
    "qualification",
    "proposal",
    "negotiation",
    "closed_won",
    "closed_lost",
  ]).default("lead"),
  probability: z.coerce.number().min(0).max(100).optional(),
  expectedCloseDate: z.coerce.date().optional(),
});

export const UpdateDealSchema = CreateDealSchema.partial().extend({
  id: z.string().uuid("Invalid ID"),
});

export type CreateDealInput = z.input<typeof CreateDealSchema>;
export type UpdateDealInput = z.input<typeof UpdateDealSchema>;

export const CreateActivitySchema = z.object({
  clientId: z.string().uuid().optional(),
  dealId: z.string().uuid().optional(),
  type: z.enum(["note", "call", "meeting", "email", "task"]),
  content: z.string().min(1, "Content is required"),
  sentiment: z.enum(["positive", "neutral", "negative"]).optional(),
  performedAt: z.coerce.date().optional(),
});

export const UpdateActivitySchema = CreateActivitySchema.partial().extend({
  id: z.string().uuid("Invalid ID"),
});

export type CreateActivityInput = z.infer<typeof CreateActivitySchema>;
export type UpdateActivityInput = z.infer<typeof UpdateActivitySchema>;
