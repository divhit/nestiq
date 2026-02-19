import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  // TODO: Dispatch to configured webhook URLs
  console.log("Lead webhook received:", body);

  return NextResponse.json({ received: true });
}
