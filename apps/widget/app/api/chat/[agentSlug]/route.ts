import { NextRequest } from "next/server";

const PLATFORM_URL = process.env.PLATFORM_URL || "http://localhost:3000";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ agentSlug: string }> }
) {
  const { agentSlug } = await params;
  const body = await req.text();

  const response = await fetch(`${PLATFORM_URL}/api/chat/${agentSlug}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  // Stream the response through
  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "text/plain",
      "Transfer-Encoding": "chunked",
    },
  });
}
