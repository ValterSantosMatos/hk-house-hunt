import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { upsertRating, getRatings, getAllRatings } from "@/lib/db";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const myRatings = await getRatings(user.name);
  const allRatings = await getAllRatings();

  return NextResponse.json({ myRatings, allRatings, userName: user.name });
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { propertyId, rating, notes } = await req.json();

  await upsertRating(propertyId, user.name, rating, notes || "");

  return NextResponse.json({ ok: true });
}
