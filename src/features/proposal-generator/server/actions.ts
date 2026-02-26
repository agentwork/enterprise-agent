"use server";

import { db } from "@/lib/db";
import { proposals, templates } from "@/lib/db/schema/proposals";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// --- Templates ---

export async function getTemplates() {
  try {
    const data = await db.select().from(templates).orderBy(desc(templates.createdAt));
    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch templates:", error);
    return { success: false, error: "Failed to fetch templates" };
  }
}

export async function getTemplate(id: string) {
  try {
    const data = await db.select().from(templates).where(eq(templates.id, id)).limit(1);
    if (!data.length) return { success: false, error: "Template not found" };
    return { success: true, data: data[0] };
  } catch (error) {
    console.error("Failed to fetch template:", error);
    return { success: false, error: "Failed to fetch template" };
  }
}

// --- Proposals ---

const createProposalSchema = z.object({
  clientId: z.string().uuid(),
  templateId: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  content: z.object({
    sections: z.array(z.any()), // Validate strictly if needed
  }),
});

export async function createProposal(input: z.infer<typeof createProposalSchema>) {
  try {
    const validated = createProposalSchema.parse(input);
    
    const [newProposal] = await db.insert(proposals).values({
      clientId: validated.clientId,
      templateId: validated.templateId,
      title: validated.title,
      content: validated.content,
      status: "draft",
    }).returning();

    revalidatePath("/dashboard/proposals");
    return { success: true, data: newProposal };
  } catch (error) {
    console.error("Failed to create proposal:", error);
    return { success: false, error: "Failed to create proposal" };
  }
}

export async function getProposals() {
  try {
    const data = await db.query.proposals.findMany({
      with: {
        client: true,
        template: true,
      },
      orderBy: desc(proposals.createdAt),
    });
    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch proposals:", error);
    return { success: false, error: "Failed to fetch proposals" };
  }
}

export async function getProposal(id: string) {
  try {
    const data = await db.query.proposals.findFirst({
      where: eq(proposals.id, id),
      with: {
        client: true,
        template: true,
      },
    });
    
    if (!data) return { success: false, error: "Proposal not found" };
    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch proposal:", error);
    return { success: false, error: "Failed to fetch proposal" };
  }
}

const updateProposalSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.object({ sections: z.array(z.any()) }).optional(),
  status: z.enum(["draft", "review", "sent", "accepted", "rejected"]).optional(),
});

export async function updateProposal(id: string, input: z.infer<typeof updateProposalSchema>) {
  try {
    const validated = updateProposalSchema.parse(input);

    const [updated] = await db.update(proposals)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(proposals.id, id))
      .returning();

    revalidatePath("/dashboard/proposals");
    revalidatePath(`/dashboard/proposals/${id}`);
    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to update proposal:", error);
    return { success: false, error: "Failed to update proposal" };
  }
}

export async function deleteProposal(id: string) {
  try {
    await db.delete(proposals).where(eq(proposals.id, id));
    revalidatePath("/dashboard/proposals");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete proposal:", error);
    return { success: false, error: "Failed to delete proposal" };
  }
}
