import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

function checkApiKey(req: Request): boolean {
  const authHeader = req.headers.get("authorization");
  const apiKey = process.env.SCANNER_API_KEY;
  if (!apiKey) return false;
  return authHeader === `Bearer ${apiKey}`;
}

// GET /api/ratings/export — pull all ratings with property details for preference learning
export async function GET(req: Request) {
  if (!checkApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized — provide SCANNER_API_KEY as Bearer token" }, { status: 401 });
  }

  try {
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!databaseUrl) throw new Error("DATABASE_URL env var is required");
    const sql = neon(databaseUrl);

    const ratings = await sql`
      SELECT
        r.user_name,
        r.rating,
        r.notes,
        r.updated_at,
        p.slug,
        p.name,
        p.phase,
        p.estate,
        p.property_type,
        p.beds,
        p.baths,
        p.gross_sqft,
        p.net_sqft,
        p.price,
        p.psf_gross,
        p.psf_net,
        p.deal_score,
        p.status,
        p.features
      FROM ratings r
      JOIN properties p ON r.property_id = p.id
      ORDER BY r.updated_at DESC
    `;

    const likes = ratings.filter(r => r.rating === 'like' || r.rating === 'star');
    const dislikes = ratings.filter(r => r.rating === 'dislike');

    const summary = {
      total_ratings: ratings.length,
      likes: likes.length,
      dislikes: dislikes.length,
      stars: ratings.filter(r => r.rating === 'star').length,
      liked_phases: [...new Set(likes.map(r => r.phase))],
      liked_estates: [...new Set(likes.map(r => r.estate))],
      liked_types: [...new Set(likes.map(r => r.property_type))],
      avg_liked_price: likes.length > 0 ? Math.round(likes.reduce((s, r) => s + Number(r.price), 0) / likes.length) : null,
      avg_liked_sqft: likes.length > 0 ? Math.round(likes.reduce((s, r) => s + Number(r.gross_sqft), 0) / likes.length) : null,
      avg_liked_psf: likes.length > 0 ? Math.round(likes.reduce((s, r) => s + Number(r.psf_gross), 0) / likes.length) : null,
      liked_features: countFeatures(likes),
      disliked_phases: [...new Set(dislikes.map(r => r.phase))],
      disliked_features: countFeatures(dislikes),
    };

    // Find properties both users liked
    const userLikes: Record<string, Set<string>> = {};
    for (const r of likes) {
      if (!userLikes[r.user_name]) userLikes[r.user_name] = new Set();
      userLikes[r.user_name].add(r.slug as string);
    }
    const users = Object.keys(userLikes);
    const bothLike = users.length >= 2
      ? [...userLikes[users[0]]].filter(slug => userLikes[users[1]]?.has(slug))
      : [];

    return NextResponse.json({
      ratings,
      summary,
      both_like: bothLike,
      exported_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Ratings export error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

function countFeatures(ratings: Record<string, unknown>[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of ratings) {
    const features = r.features as string[];
    if (Array.isArray(features)) {
      for (const f of features) {
        counts[f] = (counts[f] || 0) + 1;
      }
    }
  }
  return Object.fromEntries(
    Object.entries(counts).sort(([, a], [, b]) => b - a)
  );
}
