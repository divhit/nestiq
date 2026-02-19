import { eq, and, desc } from "drizzle-orm";
import { db } from "../client";
import { leads, conversations, messages } from "../schema";

export async function createLead(data: typeof leads.$inferInsert) {
  const result = await db.insert(leads).values(data).returning();
  return result[0];
}

export async function getLeads(
  agentId: string,
  filters?: { status?: string; limit?: number },
) {
  const conditions = [eq(leads.agentId, agentId)];

  if (filters?.status) {
    conditions.push(eq(leads.status, filters.status));
  }

  return db
    .select()
    .from(leads)
    .where(and(...conditions))
    .orderBy(desc(leads.createdAt))
    .limit(filters?.limit ?? 100);
}

export async function updateLead(
  id: string,
  data: Partial<Omit<typeof leads.$inferInsert, "id">>,
) {
  const result = await db
    .update(leads)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(leads.id, id))
    .returning();
  return result[0] ?? null;
}

export async function getLeadWithConversation(id: string) {
  const lead = await db
    .select()
    .from(leads)
    .where(eq(leads.id, id))
    .limit(1);

  if (!lead[0]) return null;

  let conversation = null;
  let conversationMessages: (typeof messages.$inferSelect)[] = [];

  if (lead[0].conversationId) {
    const convResult = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, lead[0].conversationId))
      .limit(1);

    conversation = convResult[0] ?? null;

    if (conversation) {
      conversationMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversation.id))
        .orderBy(messages.createdAt);
    }
  }

  return {
    lead: lead[0],
    conversation,
    messages: conversationMessages,
  };
}
