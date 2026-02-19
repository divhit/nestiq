import { eq, desc } from "drizzle-orm";
import { db } from "../client";
import { conversations, messages } from "../schema";

export async function createConversation(
  data: typeof conversations.$inferInsert,
) {
  const result = await db.insert(conversations).values(data).returning();
  return result[0];
}

export async function getConversations(agentId: string, limit = 50) {
  return db
    .select()
    .from(conversations)
    .where(eq(conversations.agentId, agentId))
    .orderBy(desc(conversations.createdAt))
    .limit(limit);
}

export async function getConversation(id: string) {
  const result = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function updateConversation(
  id: string,
  data: Partial<Omit<typeof conversations.$inferInsert, "id">>,
) {
  const result = await db
    .update(conversations)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(conversations.id, id))
    .returning();
  return result[0] ?? null;
}

export async function getMessages(conversationId: string) {
  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);
}

export async function createMessage(data: typeof messages.$inferInsert) {
  const result = await db.insert(messages).values(data).returning();
  return result[0];
}
