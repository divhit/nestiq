import {
  streamText,
  UIMessage,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
} from "ai";
import { google } from "@ai-sdk/google";
import { pipeJsonRender } from "@json-render/core";
import { realestateCatalog } from "@nestiq/chat-ui";
import { buildSystemPrompt, buildToolSet } from "@nestiq/chat-engine";

export const maxDuration = 30;

// In-memory cache for MVP (replace with Vercel KV later)
const agentCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function loadTenantContext(agentSlug: string) {
  // Check cache
  const cached = agentCache.get(agentSlug);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // For MVP: load from DB
  // TODO: Replace with actual DB query once Supabase is connected
  // For now, return a demo agent config
  const context = getDemoContext(agentSlug);

  agentCache.set(agentSlug, { data: context, timestamp: Date.now() });
  return context;
}

// Demo context for development
function getDemoContext(slug: string) {
  return {
    agent: {
      id: "demo-agent",
      slug,
      firstName: "Demo",
      lastName: "Agent",
      email: "demo@nestiq.com",
      phone: "555-000-0000",
      brokerage: "NestIQ Demo",
      city: "Vancouver",
      provinceState: "BC",
      country: "CA",
      primaryColor: "#0f766e",
      secondaryColor: "#f5f0eb",
      isActive: true,
    },
    config: {
      id: "demo-config",
      agentId: "demo-agent",
      llmModel: "gemini-2.0-flash",
      temperature: 0.5,
      personalityTemplate: "professional",
      firstMessage:
        "Hi! How can I help with your real estate questions?",
      quickQuestions: [
        "I'm looking to buy",
        "Tell me about neighbourhoods",
        "What can I afford?",
        "I want to sell my home",
      ],
      toolsEnabled: {
        mortgageCalc: true,
        propertyTax: true,
        contactCard: true,
        scheduleViewing: true,
        neighbourhoodMap: true,
        placesSearch: true,
        buyerSellerGuide: true,
        marketSnapshot: true,
        neighbourhoodCard: true,
      },
      currency: "CAD",
      taxCalculator: "bc_ptt",
      marketDataText:
        "Metro Vancouver composite benchmark: $1,101,900 (-5.7% YoY). Market is in buyer-friendly territory.",
    },
    neighbourhoods: [
      {
        name: "Oakridge",
        slug: "oakridge",
        centerLat: 49.2275,
        centerLng: -123.1167,
        zoom: 14,
        tagline: "Modern & High-Growth",
        avgPrice: "$1.6M",
        priceChange: "+8.2% YoY",
        walkScore: 78,
        transitScore: 85,
        highlights: [
          "Oakridge Park redevelopment",
          "Canada Line access",
          "Queen Elizabeth Park",
        ],
        fallbackPois: [],
      },
    ],
  };
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ agentSlug: string }> }
) {
  const { agentSlug } = await params;
  const { messages }: { messages: UIMessage[] } = await req.json();

  const context = await loadTenantContext(agentSlug);
  if (!context) {
    return new Response("Agent not found", { status: 404 });
  }

  const systemPrompt = buildSystemPrompt({
    agent: context.agent,
    config: context.config,
    neighbourhoods: context.neighbourhoods,
    catalogPrompt: realestateCatalog.prompt({
      mode: "chat",
      customRules: [
        "This renders inside a chat widget -- keep layouts compact but visually impressive.",
        "Use 2-4 components per spec.",
        "Prefer Cards with Metrics, Badges, and Progress bars.",
        "NEVER use viewport height classes.",
      ],
    }),
  });

  const tools = buildToolSet({
    agent: context.agent,
    config: context.config,
    neighbourhoods: context.neighbourhoods,
  });

  const model = google(context.config.llmModel || "gemini-2.0-flash");

  const result = streamText({
    model,
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(3),
    tools,
  });

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.merge(pipeJsonRender(result.toUIMessageStream()));
    },
  });

  return createUIMessageStreamResponse({ stream });
}
