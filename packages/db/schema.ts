import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  real,
  doublePrecision,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// ==========================================
// ORGANIZATIONS (brokerages)
// ==========================================
export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
    plan: text("plan").notNull().default("free"),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
);

// ==========================================
// AGENTS (individual realtors)
// ==========================================
export const agents = pgTable(
  "agents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id").references(() => organizations.id),
    clerkUserId: text("clerk_user_id").unique().notNull(),
    slug: text("slug").unique().notNull(),

    // Profile
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    photoUrl: text("photo_url"),
    bio: text("bio"),
    brokerage: text("brokerage"),
    licenseNumber: text("license_number"),

    // Location
    city: text("city").notNull(),
    provinceState: text("province_state").notNull(),
    country: text("country").notNull().default("CA"),

    // Branding
    primaryColor: text("primary_color").default("#0f766e"),
    secondaryColor: text("secondary_color").default("#f5f0eb"),
    logoUrl: text("logo_url"),

    // Status
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_agents_slug").on(table.slug),
    index("idx_agents_org").on(table.orgId),
  ],
);

// ==========================================
// AGENT CONFIGS (chatbot settings)
// ==========================================
export const agentConfigs = pgTable(
  "agent_configs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agentId: uuid("agent_id")
      .references(() => agents.id)
      .unique(),

    // AI
    llmModel: text("llm_model").default("gemini-2.0-flash"),
    temperature: real("temperature").default(0.5),

    // Personality
    personalityTemplate: text("personality_template").default("professional"),
    customInstructions: text("custom_instructions"),
    firstMessage: text("first_message").default(
      "Hi! How can I help with your real estate questions?",
    ),
    quickQuestions: jsonb("quick_questions").default([
      "Looking to buy a home",
      "Tell me about neighbourhoods",
      "What can I afford?",
      "I want to sell my home",
    ]),

    // Tools
    toolsEnabled: jsonb("tools_enabled").default({
      mortgageCalc: true,
      propertyTax: true,
      contactCard: true,
      scheduleViewing: true,
      neighbourhoodMap: true,
      placesSearch: true,
      buyerSellerGuide: true,
      marketSnapshot: true,
      neighbourhoodCard: true,
    }),

    // Regional
    currency: text("currency").default("CAD"),
    taxCalculator: text("tax_calculator").default("bc_ptt"),

    // Market data
    marketDataText: text("market_data_text"),

    // Widget
    widgetPosition: text("widget_position").default("bottom-right"),
    widgetGreeting: text("widget_greeting"),

    // Notifications
    leadNotificationEmail: text("lead_notification_email"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_configs_agent").on(table.agentId)],
);

// ==========================================
// NEIGHBOURHOODS (per agent)
// ==========================================
export const agentNeighbourhoods = pgTable(
  "agent_neighbourhoods",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agentId: uuid("agent_id").references(() => agents.id),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    centerLat: doublePrecision("center_lat").notNull(),
    centerLng: doublePrecision("center_lng").notNull(),
    zoom: integer("zoom").default(14),
    tagline: text("tagline"),
    avgPrice: text("avg_price"),
    priceChange: text("price_change"),
    walkScore: integer("walk_score"),
    transitScore: integer("transit_score"),
    highlights: jsonb("highlights").default([]),
    fallbackPois: jsonb("fallback_pois").default([]),
    sortOrder: integer("sort_order").default(0),
  },
  (table) => [
    uniqueIndex("agent_neighbourhoods_agent_id_slug_unique").on(
      table.agentId,
      table.slug,
    ),
    index("idx_neighbourhoods_agent").on(table.agentId),
  ],
);

// ==========================================
// CONVERSATIONS
// ==========================================
export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agentId: uuid("agent_id").references(() => agents.id),
    visitorId: text("visitor_id"),
    sourceUrl: text("source_url"),
    leadScore: integer("lead_score").default(0),
    leadData: jsonb("lead_data").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_conversations_agent").on(table.agentId),
    index("idx_conversations_created").on(table.createdAt),
  ],
);

// ==========================================
// MESSAGES
// ==========================================
export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id").references(() => conversations.id),
    role: text("role").notNull(),
    content: text("content"),
    toolCalls: jsonb("tool_calls"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_messages_conversation").on(table.conversationId)],
);

// ==========================================
// LEADS (extracted from conversations)
// ==========================================
export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agentId: uuid("agent_id").references(() => agents.id),
    conversationId: uuid("conversation_id").references(() => conversations.id),

    // Contact info
    name: text("name"),
    email: text("email"),
    phone: text("phone"),

    // Qualification
    intent: text("intent"),
    budgetRange: text("budget_range"),
    propertyType: text("property_type"),
    timeline: text("timeline"),
    areas: text("areas").array(),
    isFirstTime: boolean("is_first_time"),

    // Scoring
    score: integer("score").default(0),
    status: text("status").default("new"),
    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_leads_agent").on(table.agentId),
    index("idx_leads_status").on(table.agentId, table.status),
  ],
);

// ==========================================
// WEBHOOKS (per agent)
// ==========================================
export const webhooks = pgTable("webhooks", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id").references(() => agents.id),
  event: text("event").notNull(),
  url: text("url").notNull(),
  secret: text("secret"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ==========================================
// USAGE EVENTS (for billing)
// ==========================================
export const usageEvents = pgTable(
  "usage_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agentId: uuid("agent_id").references(() => agents.id),
    eventType: text("event_type").notNull(),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_usage_agent_date").on(table.agentId, table.createdAt)],
);
