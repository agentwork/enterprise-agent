"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { clients, deals, activities } from "@/lib/db/schema/crm";
import { CreateClientSchema, UpdateClientSchema, CreateDealSchema, UpdateDealSchema, CreateActivitySchema } from "../utils/validation";
import type { CreateClientInput, UpdateClientInput, CreateDealInput, UpdateDealInput, CreateActivityInput } from "../utils/validation";
import { eq, desc } from "drizzle-orm";
import { ZodError } from "zod";

export async function getClients() {
  try {
    const allClients = await db.select().from(clients).orderBy(desc(clients.createdAt));
    return { success: true, data: allClients };
  } catch (error) {
    console.error("Failed to fetch clients:", error);
    return { success: false, error: "Failed to fetch clients" };
  }
}

export async function getClient(id: string) {
  try {
    const client = await db.query.clients.findFirst({
      where: eq(clients.id, id),
    });
    
    if (!client) {
      return { success: false, error: "Client not found" };
    }
    
    return { success: true, data: client };
  } catch (error) {
    console.error(`Failed to fetch client ${id}:`, error);
    return { success: false, error: "Failed to fetch client" };
  }
}

export async function createClient(input: CreateClientInput) {
  try {
    const validatedData = CreateClientSchema.parse(input);
    
    const [newClient] = await db.insert(clients).values(validatedData).returning();
    
    revalidatePath("/dashboard/crm/clients");
    return { success: true, data: newClient };
  } catch (error) {
    console.error("Failed to create client:", error);
    if (error instanceof ZodError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const issues = (error as any).errors || (error as any).issues;
      return { success: false, error: issues?.[0]?.message || "Validation error" };
    }
    return { success: false, error: error instanceof Error ? error.message : "Failed to create client" };
  }
}

export async function updateClient(input: UpdateClientInput) {
  try {
    const validatedData = UpdateClientSchema.parse(input);
    
    // Check if id exists
    if (!validatedData.id) {
        return { success: false, error: "Client ID is required" };
    }

    const { id, ...data } = validatedData;
    
    const [updatedClient] = await db
      .update(clients)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
      
    revalidatePath("/dashboard/crm/clients");
    revalidatePath(`/dashboard/crm/clients/${id}`);
    
    return { success: true, data: updatedClient };
  } catch (error) {
    console.error("Failed to update client:", error);
    if (error instanceof ZodError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const issues = (error as any).errors || (error as any).issues;
      return { success: false, error: issues?.[0]?.message || "Validation error" };
    }
    return { success: false, error: error instanceof Error ? error.message : "Failed to update client" };
  }
}

export async function deleteClient(id: string) {
  try {
    await db.delete(clients).where(eq(clients.id, id));
    revalidatePath("/dashboard/crm/clients");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete client:", error);
    return { success: false, error: "Failed to delete client" };
  }
}

// --- Deals ---

export async function getDeals() {
  try {
    const allDeals = await db.select().from(deals).orderBy(desc(deals.createdAt));
    return { success: true, data: allDeals };
  } catch (error) {
    console.error("Failed to fetch deals:", error);
    return { success: false, error: "Failed to fetch deals" };
  }
}

export async function getDealsByClient(clientId: string) {
  try {
    const clientDeals = await db.select().from(deals).where(eq(deals.clientId, clientId)).orderBy(desc(deals.createdAt));
    return { success: true, data: clientDeals };
  } catch (error) {
    console.error(`Failed to fetch deals for client ${clientId}:`, error);
    return { success: false, error: "Failed to fetch deals" };
  }
}

export async function getDeal(id: string) {
  try {
    const deal = await db.query.deals.findFirst({
      where: eq(deals.id, id),
    });
    
    if (!deal) {
      return { success: false, error: "Deal not found" };
    }
    
    return { success: true, data: deal };
  } catch (error) {
    console.error(`Failed to fetch deal ${id}:`, error);
    return { success: false, error: "Failed to fetch deal" };
  }
}

export async function createDeal(input: CreateDealInput) {
  try {
    const validatedData = CreateDealSchema.parse(input);
    
    // Check if client exists
    const client = await db.query.clients.findFirst({
      where: eq(clients.id, validatedData.clientId),
    });
    
    if (!client) {
      return { success: false, error: "Client not found" };
    }
    
    // Use type assertion for values to satisfy Drizzle types
    const values = {
      ...validatedData,
      amount: validatedData.amount?.toString(), // Convert number to string for decimal column
      probability: validatedData.probability?.toString(),
    };

    const [newDeal] = await db.insert(deals).values(values).returning();
    
    revalidatePath("/dashboard/crm/deals");
    revalidatePath(`/dashboard/crm/clients/${validatedData.clientId}`);
    return { success: true, data: newDeal };
  } catch (error) {
    console.error("Failed to create deal:", error);
    if (error instanceof ZodError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const issues = (error as any).errors || (error as any).issues;
      return { success: false, error: issues?.[0]?.message || "Validation error" };
    }
    return { success: false, error: error instanceof Error ? error.message : "Failed to create deal" };
  }
}

export async function updateDeal(input: UpdateDealInput) {
  try {
    const validatedData = UpdateDealSchema.parse(input);
    
    if (!validatedData.id) {
        return { success: false, error: "Deal ID is required" };
    }

    const { id, ...data } = validatedData;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const values: any = { ...data };
    if (data.amount !== undefined) values.amount = data.amount?.toString();
    if (data.probability !== undefined) values.probability = data.probability?.toString();

    const [updatedDeal] = await db
      .update(deals)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(deals.id, id))
      .returning();
      
    revalidatePath("/dashboard/crm/deals");
    revalidatePath(`/dashboard/crm/deals/${id}`);
    if (updatedDeal.clientId) {
        revalidatePath(`/dashboard/crm/clients/${updatedDeal.clientId}`);
    }
    
    return { success: true, data: updatedDeal };
  } catch (error) {
    console.error("Failed to update deal:", error);
    if (error instanceof ZodError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const issues = (error as any).errors || (error as any).issues;
      return { success: false, error: issues?.[0]?.message || "Validation error" };
    }
    return { success: false, error: error instanceof Error ? error.message : "Failed to update deal" };
  }
}

export async function deleteDeal(id: string) {
  try {
    const [deletedDeal] = await db.delete(deals).where(eq(deals.id, id)).returning({ clientId: deals.clientId });
    
    revalidatePath("/dashboard/crm/deals");
    if (deletedDeal?.clientId) {
        revalidatePath(`/dashboard/crm/clients/${deletedDeal.clientId}`);
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to delete deal:", error);
    return { success: false, error: "Failed to delete deal" };
  }
}

// --- Activities ---

export async function getActivitiesByClient(clientId: string) {
  try {
    const clientActivities = await db.select().from(activities).where(eq(activities.clientId, clientId)).orderBy(desc(activities.performedAt));
    return { success: true, data: clientActivities };
  } catch (error) {
    console.error(`Failed to fetch activities for client ${clientId}:`, error);
    return { success: false, error: "Failed to fetch activities" };
  }
}

export async function getActivitiesByDeal(dealId: string) {
  try {
    const dealActivities = await db.select().from(activities).where(eq(activities.dealId, dealId)).orderBy(desc(activities.performedAt));
    return { success: true, data: dealActivities };
  } catch (error) {
    console.error(`Failed to fetch activities for deal ${dealId}:`, error);
    return { success: false, error: "Failed to fetch activities" };
  }
}

export async function createActivity(input: CreateActivityInput) {
  try {
    const validatedData = CreateActivitySchema.parse(input);
    
    // Check if client/deal exists if provided
    if (validatedData.clientId) {
        const client = await db.query.clients.findFirst({
            where: eq(clients.id, validatedData.clientId),
        });
        if (!client) {
            return { success: false, error: "Client not found" };
        }
    }

    if (validatedData.dealId) {
        const deal = await db.query.deals.findFirst({
            where: eq(deals.id, validatedData.dealId),
        });
        if (!deal) {
            return { success: false, error: "Deal not found" };
        }
    }
    
    const [newActivity] = await db.insert(activities).values(validatedData).returning();
    
    if (newActivity.clientId) {
        revalidatePath(`/dashboard/crm/clients/${newActivity.clientId}`);
    }
    if (newActivity.dealId) {
        revalidatePath(`/dashboard/crm/deals/${newActivity.dealId}`);
    }
    
    return { success: true, data: newActivity };
  } catch (error) {
    console.error("Failed to create activity:", error);
    if (error instanceof ZodError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const issues = (error as any).errors || (error as any).issues;
      return { success: false, error: issues?.[0]?.message || "Validation error" };
    }
    return { success: false, error: error instanceof Error ? error.message : "Failed to create activity" };
  }
}

export async function deleteActivity(id: string) {
  try {
    const [deletedActivity] = await db.delete(activities).where(eq(activities.id, id)).returning({ clientId: activities.clientId, dealId: activities.dealId });
    
    if (deletedActivity?.clientId) {
        revalidatePath(`/dashboard/crm/clients/${deletedActivity.clientId}`);
    }
    if (deletedActivity?.dealId) {
        revalidatePath(`/dashboard/crm/deals/${deletedActivity.dealId}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Failed to delete activity:", error);
    return { success: false, error: "Failed to delete activity" };
  }
}
