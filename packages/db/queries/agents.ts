import { eq } from "drizzle-orm";
import { db } from "../client";
import { agents, agentConfigs, agentNeighbourhoods } from "../schema";

export async function getAgentBySlug(slug: string) {
  const result = await db
    .select()
    .from(agents)
    .where(eq(agents.slug, slug))
    .limit(1);
  return result[0] ?? null;
}

export async function getAgentByClerkId(clerkId: string) {
  const result = await db
    .select()
    .from(agents)
    .where(eq(agents.clerkUserId, clerkId))
    .limit(1);
  return result[0] ?? null;
}

export async function createAgent(
  data: typeof agents.$inferInsert,
) {
  const result = await db.insert(agents).values(data).returning();
  return result[0];
}

export async function updateAgent(
  id: string,
  data: Partial<Omit<typeof agents.$inferInsert, "id">>,
) {
  const result = await db
    .update(agents)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(agents.id, id))
    .returning();
  return result[0] ?? null;
}

export async function getAgentWithConfig(slug: string) {
  const agent = await getAgentBySlug(slug);
  if (!agent) return null;

  const configResult = await db
    .select()
    .from(agentConfigs)
    .where(eq(agentConfigs.agentId, agent.id))
    .limit(1);

  const neighbourhoods = await db
    .select()
    .from(agentNeighbourhoods)
    .where(eq(agentNeighbourhoods.agentId, agent.id))
    .orderBy(agentNeighbourhoods.sortOrder);

  return {
    agent,
    config: configResult[0] ?? null,
    neighbourhoods,
  };
}
