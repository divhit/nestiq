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
        name: "Kitsilano",
        slug: "kitsilano",
        center: { lat: 49.2684, lng: -123.1681 },
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
        center: { lat: 49.2628, lng: -123.1006 },
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
      {
        name: "Kerrisdale",
        slug: "kerrisdale",
        center: { lat: 49.2333, lng: -123.1558 },
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
        center: { lat: 49.2742, lng: -123.1216 },
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
        center: { lat: 49.2497, lng: -123.1867 },
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
        center: { lat: 49.2682, lng: -123.0694 },
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
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  };
}
