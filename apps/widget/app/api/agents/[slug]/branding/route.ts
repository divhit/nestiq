import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const PLATFORM_URL = process.env.PLATFORM_URL || "http://localhost:3000";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const response = await fetch(`${PLATFORM_URL}/api/agents/${slug}/branding`, {
      cache: "no-store",
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      primaryColor: "#0f766e",
      secondaryColor: "#f5f0eb",
      agentName: "Real Estate Agent",
      firstName: "Real Estate",
      lastName: "Agent",
      email: "",
      slug,
      position: "bottom-right",
    });
  }
}
