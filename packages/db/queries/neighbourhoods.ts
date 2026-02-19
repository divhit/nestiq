import { eq } from "drizzle-orm";
import { db } from "../client";
import { agentNeighbourhoods } from "../schema";

export async function getNeighbourhoods(agentId: string) {
  return db
    .select()
    .from(agentNeighbourhoods)
    .where(eq(agentNeighbourhoods.agentId, agentId))
    .orderBy(agentNeighbourhoods.sortOrder);
}

export async function createNeighbourhood(
  data: typeof agentNeighbourhoods.$inferInsert,
) {
  const result = await db
    .insert(agentNeighbourhoods)
    .values(data)
    .returning();
  return result[0];
}

export async function updateNeighbourhood(
  id: string,
  data: Partial<Omit<typeof agentNeighbourhoods.$inferInsert, "id">>,
) {
  const result = await db
    .update(agentNeighbourhoods)
    .set(data)
    .where(eq(agentNeighbourhoods.id, id))
    .returning();
  return result[0] ?? null;
}

export async function deleteNeighbourhood(id: string) {
  const result = await db
    .delete(agentNeighbourhoods)
    .where(eq(agentNeighbourhoods.id, id))
    .returning();
  return result[0] ?? null;
}
