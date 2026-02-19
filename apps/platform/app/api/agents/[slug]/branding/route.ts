import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // TODO: Load from DB
  // For MVP, return demo agent data
  const data = getDemoBranding(slug);

  return NextResponse.json(data, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300",
    },
  });
}

function getDemoBranding(slug: string) {
  return {
    primaryColor: "#0f766e",
    secondaryColor: "#f5f0eb",
    agentName: "Demo Agent",
    firstName: "Demo",
    lastName: "Agent",
    email: "demo@nestiq.com",
    phone: "555-000-0000",
    brokerage: "NestIQ Demo Realty",
    slug,
    position: "bottom-right",
    firstMessage: "Hi! How can I help with your real estate questions?",
    quickQuestions: [
      "I'm looking to buy",
      "Tell me about neighbourhoods",
      "What can I afford?",
      "I want to sell my home",
    ],
    neighbourhoods: [
      {
        name: "Oakridge",
        slug: "oakridge",
        center: { lat: 49.2275, lng: -123.1167 },
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
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  };
}
