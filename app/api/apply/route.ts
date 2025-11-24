import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  // For now, just echo back the payload. In real use, send email/store DB.
  return NextResponse.json({ ok: true, received: body });
}


