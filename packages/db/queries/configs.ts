import { eq } from "drizzle-orm";
import { db } from "../client";
import { agentConfigs } from "../schema";

export async function getConfig(agentId: string) {
  const result = await db
    .select()
    .from(agentConfigs)
    .where(eq(agentConfigs.agentId, agentId))
    .limit(1);
  return result[0] ?? null;
}

export async function upsertConfig(
  agentId: string,
  data: Partial<Omit<typeof agentConfigs.$inferInsert, "id" | "agentId">>,
) {
  const existing = await getConfig(agentId);

  if (existing) {
    const result = await db
      .update(agentConfigs)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(agentConfigs.agentId, agentId))
      .returning();
    return result[0];
  }

  const result = await db
    .insert(agentConfigs)
    .values({ agentId, ...data })
    .returning();
  return result[0];
}
