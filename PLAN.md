# NestIQ — Real Estate AI Chatbot SaaS

## What This Is

A multi-tenant SaaS platform that gives any realtor an AI chatbot with **rich interactive UI** — mortgage calculators, neighbourhood maps, market snapshots, property tax breakdowns, scheduling forms — all rendered inline in conversation. Not just text responses.

Realtors sign up, configure their bot in 10 minutes, paste one `<script>` tag on their website, and start capturing leads.

---

## Why This Wins

Every competitor (Realty AI Madison, Structurely, Ylopo, etc.) returns **plain text** in chat. We render:

- Interactive mortgage calculators with sliders
- Neighbourhood comparison cards with walk/transit scores
- Market data snapshots with trend indicators
- Property tax breakdowns with exemption calculations
- Google Maps with neighbourhood POIs
- Scheduling/booking forms
- Step-by-step buyer/seller guides
- Data tables for property comparisons

This is powered by `@json-render` — a declarative spec system where the AI generates JSON that maps to React components. The AI can compose **novel visual layouts on the fly**, not limited to hardcoded templates.

---

## What We're Extracting From

The existing `aparna-kapur-website` has all of this working for one realtor. Here's what exists:

### Chat Engine (`src/app/api/chat/route.ts`)
- 450+ line system prompt with lead qualification strategy
- 6 AI tool definitions: `showMortgageCalculator`, `showPropertyTaxEstimate`, `showContactCard`, `scheduleViewing`, `showNeighbourhoodMap`, `searchNearbyPlaces`
- Vercel AI SDK v6 + Google Gemini Flash
- Streaming responses with json-render spec interleaving

### 10 Interactive Tool Components (`src/components/chat/tools/`)
1. **MiniMortgageCalc** — Home price slider (200K-3M), down payment %, interest rate, monthly payment calc
2. **PropertyTaxBreakdown** — BC Property Transfer Tax with tiered rates, first-time buyer exemptions
3. **NeighbourhoodCard** — Name, avg price, price change, walk/transit scores, highlights, link to guide
4. **MarketSnapshot** — 3-metric grid: avg price, days on market, active listings with trend icons
5. **ContactCard** — Agent photo, name, phone, email, call/text/email buttons
6. **ScheduleViewing** — Form: name, email, phone, message → submits to agent's email via Resend
7. **BuyerSellerGuide** — 6-step process timeline (pre-approval → closing)
8. **NeighbourhoodMapCard** — Google Map centered on neighbourhood with POIs
9. **PlacesSearchCard** — Google Places search widget with location bias
10. **PlacesResultCard** — Search results with ratings, descriptions, Google Maps links

### 13 JSON-Render Catalog Components (`src/lib/render/`)
Stack, Card, Grid, Heading, Text, Metric, Badge, Table, Progress, Callout, Accordion, Timeline, Separator, Link

### Chat UI (`src/components/chat/`)
- **ChatWidget** — Floating bubble + expandable chat panel (all pages)
- **HeroChat** — Inline chat on homepage (dark theme)
- Both share `renderPart` logic for mapping tool invocations to React components

### What's Hardcoded (must be abstracted)
- Agent name "Aparna Kapur" — 122+ references across 38 files
- Phone: 604-612-7694
- Email: aparna@aparnakapur.com
- Brokerage: Oakwyn Realty
- 6 Vancouver neighbourhoods with coordinates, scores, POIs
- BC-specific property tax calculator
- Market data (GVR January 2026 benchmarks)
- Teal/warm color scheme in registry.tsx
- Contact form recipient email

---

## Technical Architecture

### Monorepo Structure

```
nestiq/
  apps/
    platform/                 # Agent dashboard + APIs
      app/
        (auth)/               # Clerk auth pages (sign-in, sign-up)
        dashboard/
          page.tsx            # Overview: conversations, leads, activity
          profile/page.tsx    # Edit agent profile
          bot/page.tsx        # Configure chatbot (personality, tools, questions)
          neighbourhoods/     # CRUD neighbourhoods with map picker
          market-data/        # Paste/edit market data
          embed/page.tsx      # Copy embed code + live preview
          leads/page.tsx      # Lead table with conversation links
          conversations/      # Conversation history browser
          billing/page.tsx    # Stripe subscription management
          analytics/page.tsx  # Usage stats, top questions, conversion funnel
        api/
          chat/[agentSlug]/route.ts    # Tenant-aware streaming chat
          agents/[slug]/branding/route.ts  # Agent branding for widget
          webhooks/leads/route.ts      # Webhook dispatcher
      middleware.ts           # Clerk auth + tenant resolution

    widget/                   # Embeddable chat widget app
      app/
        chat/[agentSlug]/page.tsx  # The chat UI served in iframe
        api/
          chat/[agentSlug]/route.ts  # Proxies to platform API
      public/
        v1/embed.js           # The <script> tag loader (~3KB)

  packages/
    chat-ui/                  # Extracted from aparna-kapur-website
      components/
        tools/                # 10 tool components (refactored with props)
          MortgageCalc.tsx
          PropertyTaxBreakdown.tsx
          ContactCard.tsx
          ScheduleViewing.tsx
          NeighbourhoodCard.tsx
          MarketSnapshot.tsx
          BuyerSellerGuide.tsx
          NeighbourhoodMap.tsx
          PlacesSearch.tsx
          PlacesResults.tsx
        ChatPanel.tsx         # The main chat UI panel
        ChatBubble.tsx        # Floating bubble trigger
      render/
        catalog.ts            # 13 json-render component specs
        registry.tsx          # React implementations (CSS variable themed)
        renderer.tsx          # @json-render/react wrapper
      types.ts                # AgentProfile, Neighbourhood, ToolConfig types

    chat-engine/              # Prompt + tool composition
      prompt-builder.ts       # Composes system prompt from tenant config
      tool-builder.ts         # Returns enabled tools parameterized with agent data
      lead-extractor.ts       # Post-conversation lead scoring
      tax-calculators/        # Regional tax calculator adapters
        bc-ptt.ts             # BC Property Transfer Tax
        on-ltt.ts             # Ontario Land Transfer Tax
        ab-ltt.ts             # Alberta (no LTT)
        generic.ts            # Fallback
      types.ts

    db/                       # Database layer
      schema.ts               # Drizzle schema (all tables)
      migrations/             # SQL migrations
      queries/                # Typed query functions
        agents.ts
        configs.ts
        conversations.ts
        leads.ts
        neighbourhoods.ts
      index.ts                # Export all

    shared/                   # Shared utilities
      types.ts                # Common types
      utils.ts                # Formatters, validators
```

### Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 16 + React 19 | Already using it, app router, server components |
| Monorepo | Turborepo + pnpm | Build caching, workspace protocol |
| Database | Supabase PostgreSQL | RLS for tenant isolation, realtime, generous free tier |
| ORM | Drizzle | Type-safe, lightweight, great DX with Supabase |
| Auth | Clerk | Native Next.js, org management, MFA |
| Cache | Vercel KV (Redis) | Agent config cache (5min TTL), rate limiting |
| Billing | Stripe | Subscriptions + usage-based metering |
| Email | Resend | Lead notifications, onboarding emails |
| LLM | Google Gemini Flash | Cheapest, fast, tool calling, Google Maps grounding |
| AI SDK | Vercel AI SDK v6 | Already using, model-agnostic, streaming |
| JSON Render | @json-render/core + react | Already using, declarative component specs |
| Maps | Google Maps API | Already using, Places search, neighbourhood maps |
| Deploy | Vercel | Both apps, edge functions, KV |

### Database Schema

```sql
-- ==========================================
-- ORGANIZATIONS (brokerages)
-- ==========================================
CREATE TABLE organizations (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   TEXT NOT NULL,
  slug                   TEXT UNIQUE NOT NULL,
  plan                   TEXT NOT NULL DEFAULT 'free',  -- free, starter, pro, enterprise
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- AGENTS (individual realtors)
-- ==========================================
CREATE TABLE agents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id),
  clerk_user_id   TEXT UNIQUE NOT NULL,
  slug            TEXT UNIQUE NOT NULL,         -- "aparna-kapur" -> widget URL

  -- Profile
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  photo_url       TEXT,
  bio             TEXT,
  brokerage       TEXT,
  license_number  TEXT,

  -- Location
  city            TEXT NOT NULL,
  province_state  TEXT NOT NULL,
  country         TEXT NOT NULL DEFAULT 'CA',

  -- Branding
  primary_color   TEXT DEFAULT '#0f766e',
  secondary_color TEXT DEFAULT '#f5f0eb',
  logo_url        TEXT,

  -- Status
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- AGENT CONFIGS (chatbot settings)
-- ==========================================
CREATE TABLE agent_configs (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id                UUID REFERENCES agents(id) UNIQUE,

  -- AI
  llm_model               TEXT DEFAULT 'gemini-2.0-flash',
  temperature             REAL DEFAULT 0.5,

  -- Personality
  personality_template    TEXT DEFAULT 'professional', -- professional, friendly, expert
  custom_instructions     TEXT,                        -- Appended to system prompt
  first_message           TEXT DEFAULT 'Hi! How can I help with your real estate questions?',
  quick_questions         JSONB DEFAULT '["I''m looking to buy", "Tell me about neighbourhoods", "What can I afford?", "I want to sell my home"]',

  -- Tools
  tools_enabled           JSONB DEFAULT '{
    "mortgageCalc": true,
    "propertyTax": true,
    "contactCard": true,
    "scheduleViewing": true,
    "neighbourhoodMap": true,
    "placesSearch": true,
    "buyerSellerGuide": true,
    "marketSnapshot": true,
    "neighbourhoodCard": true
  }',

  -- Regional
  currency                TEXT DEFAULT 'CAD',
  tax_calculator          TEXT DEFAULT 'bc_ptt',  -- bc_ptt, on_ltt, ab_ltt, generic

  -- Market data (agent pastes or we provide)
  market_data_text        TEXT,                    -- Free-form market data for system prompt

  -- Widget
  widget_position         TEXT DEFAULT 'bottom-right',
  widget_greeting         TEXT,

  -- Notifications
  lead_notification_email TEXT,                    -- Defaults to agent.email

  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- NEIGHBOURHOODS (per agent)
-- ==========================================
CREATE TABLE agent_neighbourhoods (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id        UUID REFERENCES agents(id),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL,
  center_lat      DOUBLE PRECISION NOT NULL,
  center_lng      DOUBLE PRECISION NOT NULL,
  zoom            INT DEFAULT 14,
  tagline         TEXT,
  avg_price       TEXT,
  price_change    TEXT,
  walk_score      INT,
  transit_score   INT,
  highlights      JSONB DEFAULT '[]',
  fallback_pois   JSONB DEFAULT '[]',
  sort_order      INT DEFAULT 0,
  UNIQUE(agent_id, slug)
);

-- ==========================================
-- CONVERSATIONS
-- ==========================================
CREATE TABLE conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    UUID REFERENCES agents(id),
  visitor_id  TEXT,                -- Anonymous cookie/fingerprint
  source_url  TEXT,                -- Page where chat started
  lead_score  INT DEFAULT 0,
  lead_data   JSONB DEFAULT '{}', -- {intent, budget, timeline, areas, firstTimeBuyer}
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- MESSAGES
-- ==========================================
CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  role            TEXT NOT NULL,   -- user, assistant
  content         TEXT,
  tool_calls      JSONB,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- LEADS (extracted from conversations)
-- ==========================================
CREATE TABLE leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id        UUID REFERENCES agents(id),
  conversation_id UUID REFERENCES conversations(id),

  -- Contact info (from ScheduleViewing/ContactCard submissions)
  name            TEXT,
  email           TEXT,
  phone           TEXT,

  -- Qualification (extracted by AI)
  intent          TEXT,             -- buying, selling, exploring
  budget_range    TEXT,
  property_type   TEXT,
  timeline        TEXT,
  areas           TEXT[],
  is_first_time   BOOLEAN,

  -- Scoring
  score           INT DEFAULT 0,   -- 0-100
  status          TEXT DEFAULT 'new', -- new, contacted, qualified, converted
  notes           TEXT,

  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- WEBHOOKS (per agent)
-- ==========================================
CREATE TABLE webhooks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    UUID REFERENCES agents(id),
  event       TEXT NOT NULL,       -- lead.created, lead.qualified, conversation.ended
  url         TEXT NOT NULL,
  secret      TEXT,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- USAGE EVENTS (for billing)
-- ==========================================
CREATE TABLE usage_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    UUID REFERENCES agents(id),
  event_type  TEXT NOT NULL,       -- chat_message, tool_call, lead_captured
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX idx_agents_slug ON agents(slug);
CREATE INDEX idx_agents_org ON agents(org_id);
CREATE INDEX idx_configs_agent ON agent_configs(agent_id);
CREATE INDEX idx_neighbourhoods_agent ON agent_neighbourhoods(agent_id);
CREATE INDEX idx_conversations_agent ON conversations(agent_id);
CREATE INDEX idx_conversations_created ON conversations(created_at);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_leads_agent ON leads(agent_id);
CREATE INDEX idx_leads_status ON leads(agent_id, status);
CREATE INDEX idx_usage_agent_date ON usage_events(agent_id, created_at);
```

### Multi-Tenant Chat API Flow

```
1. Widget sends message to /api/chat/[agentSlug]

2. Route handler:
   a. Resolve agent from slug (cached in Vercel KV, 5min TTL)
   b. Load agent_config + agent_neighbourhoods from DB
   c. Check usage limits (rate limit via Vercel KV)

3. Build system prompt:
   buildSystemPrompt({
     agent,          // name, phone, email, brokerage, city
     config,         // personality, custom instructions
     neighbourhoods, // names, coords, scores, prices
     marketData,     // free-form text
     enabledTools,   // which tools are available
     catalog,        // json-render spec instructions
   })

4. Build tool set:
   buildToolSet({
     agent,          // for ContactCard props
     config,         // for PropertyTax calculator type
     neighbourhoods, // for map coordinates
   })
   → Only returns tools that are enabled in config

5. Stream response via Vercel AI SDK
   → json-render specs interleaved via pipeJsonRender

6. Log usage event asynchronously
7. Update conversation in DB asynchronously
```

### Embeddable Widget

**What the realtor pastes on their site:**
```html
<script src="https://widget.nestiq.com/v1/embed.js" data-agent="aparna-kapur" async></script>
```

**What embed.js does (~3KB gzipped):**
1. Creates a floating chat bubble button (styled with agent's primary color)
2. On click, opens an iframe pointing to `widget.nestiq.com/chat/[agentSlug]`
3. iframe contains the full chat UI (ChatPanel + tool components)
4. postMessage API for:
   - `nestiq:close` — close the widget
   - `nestiq:lead` — fire a GTM/analytics event on the host page
   - `nestiq:resize` — adjust iframe height for inline embeds
5. Mobile: iframe goes full-screen with close button

**Why iframe (not Web Component):**
- Complete CSS isolation — Tailwind + json-render components render identically on any host site
- No CSS conflicts with WordPress themes, Squarespace styles, etc.
- Security: chat content is sandboxed

**Widget theming:**
- Agent's primary_color and secondary_color loaded from `/api/agents/[slug]/branding`
- Applied as CSS variables: `--nestiq-primary`, `--nestiq-bg`
- registry.tsx uses CSS variables instead of hardcoded `teal-700`, `warm-50`

### Onboarding Flow (6 steps)

```
Step 1: Sign Up
  → Clerk (Google, email, or phone)
  → Collect: first name, last name, email

Step 2: Profile
  → Photo upload, phone, brokerage, license number
  → City + province/state selection (determines tax calculator)

Step 3: Personality
  → Choose template: Professional / Friendly / Expert / Custom
  → Each sets: tone, emoji usage, formality, response length
  → Optional: "What should your bot emphasize?"
    [ ] Neighbourhood expertise
    [ ] First-time buyer guidance
    [ ] Luxury market
    [ ] Investment properties
  → Custom instructions text area (advanced)

Step 4: Neighbourhoods
  → Map-based picker: click to add neighbourhoods
  → For each: name, tagline, avg price, walk/transit scores, highlights
  → Start with 1-3 (free), up to 10 (starter), unlimited (pro)

Step 5: Market Data
  → Paste your market data (free-form text)
  → Guidance: "Include average prices, trends, days on market"
  → We inject this verbatim into the system prompt
  → Optional: skip and add later

Step 6: Get Embed Code
  → Preview the widget with your branding and data
  → Test a conversation
  → Copy the <script> tag
  → Instructions for WordPress, Squarespace, Wix, custom HTML
```

---

## Business Model

### Pricing Tiers

| Feature | Free | Starter $49/mo | Pro $149/mo | Enterprise $499+/mo |
|---------|------|----------------|-------------|---------------------|
| Conversations/month | 50 | 500 | 2,500 | Unlimited |
| Neighbourhoods | 3 | 10 | Unlimited | Unlimited |
| Tools | Basic 5 | All 10 | All + custom | Custom tools |
| Lead capture | Email only | Email + dashboard | CRM + webhooks | Salesforce/HubSpot |
| Branding | NestIQ badge | Custom colors | White-label | Full white-label |
| Widget embeds | 1 site | 3 sites | Unlimited | Unlimited |
| Quick questions | 4 default | Custom | Custom + A/B test | Custom |
| Analytics | None | Basic | Advanced | Custom |
| Support | Community | Email | Priority | Dedicated |

### Unit Economics (Pro tier)

| Item | Cost/month |
|------|-----------|
| Gemini API (~7.5M tokens) | ~$8 |
| Supabase (prorated) | ~$2 |
| Vercel (prorated) | ~$1 |
| Resend emails | ~$0.50 |
| Google Maps API | ~$3 |
| **Total cost** | **~$15** |
| **Revenue** | **$149** |
| **Gross margin** | **~90%** |

### Go-to-Market

**Phase 1 — First 20 agents (weeks 1-6):**
- Direct outreach to Vancouver realtors (Oakwyn Realty network)
- Free Pro for 3 months in exchange for feedback + testimonial
- Demo with Aparna's live site as proof: "This is what YOUR website gets"

**Phase 2 — First 100 agents (months 2-4):**
- YouTube: "I built an AI chatbot that generates leads for realtors"
- Real estate agent Facebook groups (demo videos, not spam)
- Partnership with real estate coaches
- SEO: "AI chatbot for realtors", "real estate lead gen chatbot"
- Free tier as growth engine

**Phase 3 — Scale (months 4-12):**
- "Powered by NestIQ" badge on free widgets (viral loop)
- Referral program: 1 month free per referral
- Brokerage deals: "Deploy to all your agents at once"
- Conference demos at RE/MAX, Century 21 events

### Revenue Projections

| Month | Free Agents | Paid Agents | MRR |
|-------|-------------|-------------|-----|
| 3 | 50 | 15 | $1,485 |
| 6 | 300 | 80 | $8,420 |
| 9 | 600 | 180 | $19,620 |
| 12 | 1,200 | 350 | $38,150 |

**ARR at 12 months: ~$458K**
Assumptions: 25% free-to-paid conversion, 60/40 Starter/Pro split, 3% monthly churn

---

## Implementation Phases

### Phase 1: MVP (4-6 weeks) — Enough to charge money

#### Week 1-2: Foundation
- [ ] Monorepo setup: Turborepo + pnpm, `apps/platform`, `apps/widget`, `packages/*`
- [ ] Supabase project: create all tables, RLS policies, indexes
- [ ] Drizzle ORM setup in `packages/db/`: schema, migrations, typed queries
- [ ] Clerk auth: sign-up, sign-in, middleware, user-to-agent sync
- [ ] Extract chat components from `aparna-kapur-website` into `packages/chat-ui/`
  - Copy all 10 tool components, refactor to accept `AgentProfile` prop
  - Copy catalog.ts, registry.tsx (refactor colors to CSS variables), renderer.tsx
  - Copy ChatPanel (from ChatWidget), refactor to accept config props
- [ ] Extract prompt/tool logic into `packages/chat-engine/`
  - `prompt-builder.ts`: compose system prompt from agent config
  - `tool-builder.ts`: return enabled tools parameterized with agent data

#### Week 2-3: Tenant-Aware Chat API
- [ ] `/api/chat/[agentSlug]/route.ts` in platform app
  - Load agent + config + neighbourhoods from DB
  - Cache in Vercel KV (5min TTL)
  - Call promptBuilder + toolBuilder
  - Stream response with pipeJsonRender
- [ ] Usage event logging (async, non-blocking)
- [ ] Conversation + message storage in DB (async)
- [ ] Rate limiting via Vercel KV (per-agent, per-plan limits)

#### Week 3-4: Agent Dashboard
- [ ] `/dashboard` — overview cards: total conversations, leads, active today
- [ ] `/dashboard/profile` — edit: name, phone, email, photo, brokerage, city, colors
- [ ] `/dashboard/bot` — personality template dropdown, custom instructions textarea, first message, quick questions editor, tool toggles (checkboxes)
- [ ] `/dashboard/neighbourhoods` — list + add/edit/delete, map picker for coordinates
- [ ] `/dashboard/market-data` — textarea with guidance for market data
- [ ] `/dashboard/embed` — agent's embed code + live preview iframe
- [ ] `/dashboard/leads` — table: name, email, score, intent, status, date + click to view conversation
- [ ] `/dashboard/conversations` — list with search, click to view full message history

#### Week 4-5: Embeddable Widget
- [ ] `apps/widget` — lightweight Next.js app
- [ ] `/chat/[agentSlug]` — full chat UI page (renders in iframe)
- [ ] `/v1/embed.js` — the loader script (creates bubble + iframe)
- [ ] CSS variable theming: primary color, background from agent config
- [ ] `/api/agents/[slug]/branding` — returns colors for embed.js
- [ ] postMessage communication (close, lead events, resize)
- [ ] Mobile responsive: full-screen on mobile, close button
- [ ] Test on WordPress, Squarespace, plain HTML

#### Week 5-6: Lead Capture + Polish
- [ ] Lead extraction from ScheduleViewing + ContactCard form submissions → leads table
- [ ] Email notification to agent via Resend on new lead
- [ ] Basic lead scoring based on conversation signals
- [ ] Onboarding flow (6-step wizard for new agents)
- [ ] Landing page at nestiq.com (marketing site)
- [ ] End-to-end testing: sign up → configure → embed → chat → lead captured

**MVP Deliverable**: A realtor signs up, configures their bot in 10 minutes, pastes embed code on their site, gets lead email notifications. Chat renders interactive mortgage calculators, maps, market data, scheduling forms.

### Phase 2: V1 (months 2-3) — Full self-serve product
- [ ] AI lead scoring: post-conversation Gemini call extracts intent/budget/timeline → 0-100 score
- [ ] Webhook system: push lead data to any URL on lead.created, lead.qualified, conversation.ended
- [ ] Stripe billing: free/starter/pro tiers, usage metering, upgrade/downgrade
- [ ] Analytics dashboard: messages/day, leads/day, top questions, conversion funnel, avg conversation length
- [ ] Regional tax calculators: Ontario LTT, Alberta (no LTT), generic/US
- [ ] Mortgage calc regionalization: USD, default rates per country
- [ ] Multi-language prompt templates: English, French, Mandarin, Punjabi
- [ ] Widget A/B testing: test different quick questions, greetings
- [ ] Conversation export (CSV)
- [ ] "Powered by NestIQ" viral badge on free tier

### Phase 3: V2 (months 4-6) — Growth features
- [ ] MLS/IDX integration: pull active listings into chat context, recommend specific properties
- [ ] ElevenLabs voice channel: same agent config powers both text and voice conversations
- [ ] Team/brokerage dashboard: one org manages multiple agents, shared market data, centralized billing
- [ ] Custom tools API: agents define their own tools (Calendly link, listing search, etc.)
- [ ] Chat-to-SMS handoff: lead gives phone number, agent continues via SMS
- [ ] White-label: remove NestIQ branding, custom domain support (CNAME)
- [ ] Zapier native integration (triggers + actions)
- [ ] HubSpot native integration
- [ ] City-specific data: auto-populate market data from public APIs per city

---

## Key Files to Extract from aparna-kapur-website

### Must extract (core product):
| Source File | Destination | Refactoring Needed |
|-------------|-------------|-------------------|
| `src/app/api/chat/route.ts` | `packages/chat-engine/` | Decompose 450-line file into prompt-builder.ts + tool-builder.ts |
| `src/components/chat/tools/*.tsx` (10 files) | `packages/chat-ui/components/tools/` | Replace hardcoded "Aparna" with AgentProfile prop on each |
| `src/components/chat/ChatWidget.tsx` | `packages/chat-ui/components/ChatPanel.tsx` | Extract renderPart logic, accept config as props |
| `src/lib/render/catalog.ts` | `packages/chat-ui/render/catalog.ts` | As-is (already generic) |
| `src/lib/render/registry.tsx` | `packages/chat-ui/render/registry.tsx` | Replace hardcoded teal/warm colors with CSS variables |
| `src/lib/render/renderer.tsx` | `packages/chat-ui/render/renderer.tsx` | As-is (already generic) |
| `src/lib/neighborhoods.ts` | `packages/shared/types.ts` | Types only — data moves to DB |
| `src/app/actions/contact.ts` | `packages/chat-engine/` | Accept agentId, look up email from DB |

### Specific hardcoded references to fix per tool component:
| Component | Hardcoded | Fix |
|-----------|-----------|-----|
| ContactCard.tsx | "Aparna Kapur", phone, email | Accept `AgentProfile` prop |
| ScheduleViewing.tsx | `submitContactForm` sends to hardcoded email | Accept `agentEmail` prop, use dynamic endpoint |
| MarketSnapshot.tsx | "Contact Aparna" text | Use `agentName` from prop |
| PlacesSearchCard.tsx | "Contact Aparna" fallback | Use `agentName` from prop |
| PlacesResultCard.tsx | "Contact Aparna" fallback | Use `agentName` from prop |
| MiniMortgageCalc.tsx | CAD currency, $3M max | Add `currency` and `maxPrice` props |
| PropertyTaxBreakdown.tsx | BC PTT rates hardcoded | Abstract to `TaxCalculator` interface |
| BuyerSellerGuide.tsx | Links to `/buying/guide` | Accept `baseUrl` or make links configurable |
| NeighbourhoodMapCard.tsx | Imports from `neighborhoods.ts` | Accept neighbourhood data as props |
| NeighbourhoodCard.tsx | Already prop-driven | Minor: accept `agentSlug` for link building |

---

## Critical Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Widget isolation | iframe | Complete CSS/JS isolation from any host site |
| Multi-tenancy | Shared DB + Supabase RLS | Simpler than DB-per-tenant at hundreds of agents scale |
| Auth | Clerk | Native Next.js middleware, org management, handles sign-up UX |
| LLM provider | Gemini Flash (via Vercel AI SDK) | Cheapest per token, fast, Google Maps grounding for Places tool. AI SDK abstracts so we can swap later. |
| Monorepo | Turborepo + pnpm | Build caching, workspace protocol, tree-shaking per app |
| Database | Supabase PostgreSQL | RLS, realtime (future), edge functions, free tier |
| ORM | Drizzle | Type-safe, lightweight, Supabase-compatible |
| State/Cache | Vercel KV | Agent config cache, rate limiting, session data |
| Prompt approach | Composable builder | Not a single hardcoded string — sections assembled from config |

---

## Success Metrics

### MVP (week 6)
- 5+ realtors using the embedded widget on their live sites
- Chat correctly uses each agent's name, neighbourhoods, market data
- Leads captured and emailed to agents
- Zero CSS conflicts on 3+ different host site platforms

### V1 (month 3)
- 50+ signed-up agents, 15+ paying
- $1,500+ MRR
- Lead scoring working (scores correlate with actual conversions)
- Webhooks firing to Zapier/CRM

### V2 (month 6)
- 300+ agents, 80+ paying
- $8,000+ MRR
- Voice channel live for 10+ agents
- First brokerage enterprise deal
