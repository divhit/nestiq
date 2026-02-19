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
        name: "Kitsilano",
        slug: "kitsilano",
        centerLat: 49.2684,
        centerLng: -123.1681,
        zoom: 14,
        tagline: "Beach Lifestyle & Vibrant Community",
        avgPrice: "$1.8M",
        priceChange: "+3.5% YoY",
        walkScore: 88,
        transitScore: 72,
        highlights: [
          "Kitsilano Beach & outdoor pool",
          "West 4th Ave shopping & dining",
          "Close to UBC & Pacific Spirit Park",
        ],
        fallbackPois: [],
      },
      {
        name: "Mount Pleasant",
        slug: "mount-pleasant",
        centerLat: 49.2628,
        centerLng: -123.1006,
        zoom: 14,
        tagline: "Creative Hub & Craft Brewery Capital",
        avgPrice: "$1.1M",
        priceChange: "+4.1% YoY",
        walkScore: 92,
        transitScore: 80,
        highlights: [
          "Main Street village & breweries",
          "Thriving arts & mural scene",
          "Close to SkyTrain & downtown",
        ],
        fallbackPois: [],
      },
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
      {
        name: "Kerrisdale",
        slug: "kerrisdale",
        centerLat: 49.2333,
        centerLng: -123.1558,
        zoom: 14,
        tagline: "Classic Westside Elegance",
        avgPrice: "$2.4M",
        priceChange: "+2.8% YoY",
        walkScore: 82,
        transitScore: 70,
        highlights: [
          "Boutique shopping on 41st Ave",
          "Elm Park & quiet tree-lined streets",
          "Top-rated schools",
        ],
        fallbackPois: [],
      },
      {
        name: "Yaletown",
        slug: "yaletown",
        centerLat: 49.2742,
        centerLng: -123.1216,
        zoom: 15,
        tagline: "Urban Chic & Waterfront Living",
        avgPrice: "$850K",
        priceChange: "+1.9% YoY",
        walkScore: 96,
        transitScore: 95,
        highlights: [
          "Seawall & marina access",
          "Trendy restaurants & nightlife",
          "Walking distance to everything",
        ],
        fallbackPois: [],
      },
      {
        name: "Dunbar-Southlands",
        slug: "dunbar-southlands",
        centerLat: 49.2497,
        centerLng: -123.1867,
        zoom: 14,
        tagline: "Family-Friendly & Close to Nature",
        avgPrice: "$2.8M",
        priceChange: "+3.2% YoY",
        walkScore: 72,
        transitScore: 55,
        highlights: [
          "Pacific Spirit Regional Park",
          "Dunbar Village shops",
          "Top schools & family community",
        ],
        fallbackPois: [],
      },
      {
        name: "Commercial Drive",
        slug: "commercial-drive",
        centerLat: 49.2682,
        centerLng: -123.0694,
        zoom: 14,
        tagline: "Eclectic & Multicultural",
        avgPrice: "$950K",
        priceChange: "+5.3% YoY",
        walkScore: 93,
        transitScore: 88,
        highlights: [
          "Diverse food scene & indie shops",
          "Grandview Park & community gardens",
          "SkyTrain at Commercial-Broadway",
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
