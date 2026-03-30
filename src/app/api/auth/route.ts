import { NextResponse } from "next/server";
import { createSession, logout } from "@/lib/auth";

export async function POST(req: Request) {
  const { name, password } = await req.json();

  if (password !== process.env.AUTH_PASSWORD) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const displayName = (name || "Anonymous").trim().slice(0, 30);
  await createSession(displayName);

  return NextResponse.json({ ok: true, name: displayName });
}

export async function DELETE() {
  await logout();
  return NextResponse.json({ ok: true });
}
