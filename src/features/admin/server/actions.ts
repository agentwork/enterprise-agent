"use server";

import { db } from "@/lib/db";
import { systemSettings, mcpServers } from "@/lib/db/schema/admin";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// --- System Settings ---

export async function getSystemSetting(key: string) {
  try {
    const result = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, key))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error(`Failed to get system setting ${key}:`, error);
    return null;
  }
}

export async function setSystemSetting(key: string, value: unknown, description?: string, isEncrypted = false) {
  try {
    const existing = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, key))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(systemSettings)
        .set({
          value,
          description,
          isEncrypted,
          updatedAt: new Date(),
        })
        .where(eq(systemSettings.key, key));
    } else {
      await db.insert(systemSettings).values({
        key,
        value,
        description,
        isEncrypted,
        updatedAt: new Date(),
      });
    }

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error(`Failed to set system setting ${key}:`, error);
    return { success: false, error: "Failed to save setting" };
  }
}

// --- MCP Servers ---

const MCPServerSchema = z.object({
  name: z.string().min(1),
  command: z.string().min(1),
  args: z.array(z.string()),
  env: z.record(z.string(), z.string()),
  isEnabled: z.boolean(),
});

export async function getMCPServers() {
  try {
    return await db.select().from(mcpServers);
  } catch (error) {
    console.error("Failed to get MCP servers:", error);
    return [];
  }
}

export async function addMCPServer(data: z.infer<typeof MCPServerSchema>) {
  try {
    const validated = MCPServerSchema.parse(data);
    await db.insert(mcpServers).values({
      name: validated.name,
      command: validated.command,
      args: validated.args,
      env: validated.env as Record<string, string>,
      isEnabled: validated.isEnabled,
    });
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to add MCP server:", error);
    return { success: false, error: "Failed to add server" };
  }
}

export async function updateMCPServer(id: string, data: Partial<z.infer<typeof MCPServerSchema>>) {
  try {
    const updateData = { ...data, updatedAt: new Date() };
    
    await db
      .update(mcpServers)
      .set(updateData)
      .where(eq(mcpServers.id, id));
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to update MCP server:", error);
    return { success: false, error: "Failed to update server" };
  }
}

export async function deleteMCPServer(id: string) {
  try {
    await db.delete(mcpServers).where(eq(mcpServers.id, id));
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete MCP server:", error);
    return { success: false, error: "Failed to delete server" };
  }
}
