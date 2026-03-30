import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { initDB } from "@/lib/db";

function checkApiKey(req: Request): boolean {
  const authHeader = req.headers.get("authorization");
  const apiKey = process.env.SCANNER_API_KEY;
  if (!apiKey) return false;
  return authHeader === `Bearer ${apiKey}`;
}

// POST /api/properties — push new properties from the local scanner
export async function POST(req: Request) {
  if (!checkApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized — provide SCANNER_API_KEY as Bearer token" }, { status: 401 });
  }

  try {
    await initDB();

    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!databaseUrl) throw new Error("DATABASE_URL env var is required");
    const sql = neon(databaseUrl);

    const { properties } = await req.json();

    if (!Array.isArray(properties) || properties.length === 0) {
      return NextResponse.json({ error: "Provide { properties: [...] }" }, { status: 400 });
    }

    let count = 0;
    for (const p of properties) {
      await sql`
        INSERT INTO properties (slug, name, phase, estate, property_type, beds, baths, gross_sqft, net_sqft, price, psf_gross, psf_net, deal_score, status, features, listing_urls, image_url)
        VALUES (
          ${p.slug}, ${p.name}, ${p.phase}, ${p.estate}, ${p.property_type},
          ${p.beds || null}, ${p.baths || null},
          ${p.gross_sqft || null}, ${p.net_sqft || null},
          ${p.price}, ${p.psf_gross || null}, ${p.psf_net || null},
          ${p.deal_score || 0}, ${p.status || 'listing'},
          ${JSON.stringify(p.features || [])},
          ${JSON.stringify(p.listing_urls || [])},
          ${p.image_url || null}
        )
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          phase = EXCLUDED.phase,
          price = EXCLUDED.price,
          psf_gross = EXCLUDED.psf_gross,
          psf_net = EXCLUDED.psf_net,
          deal_score = EXCLUDED.deal_score,
          status = EXCLUDED.status,
          features = EXCLUDED.features,
          listing_urls = EXCLUDED.listing_urls,
          image_url = COALESCE(EXCLUDED.image_url, properties.image_url)
      `;
      count++;
    }

    return NextResponse.json({ ok: true, count, message: `${count} properties synced` });
  } catch (error) {
    console.error("Properties push error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// GET /api/properties — list all properties (for scanner to check state)
export async function GET(req: Request) {
  if (!checkApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!databaseUrl) throw new Error("DATABASE_URL env var is required");
    const sql = neon(databaseUrl);

    const rows = await sql`SELECT slug, name, price, deal_score, status, created_at FROM properties ORDER BY deal_score DESC`;
    return NextResponse.json({ properties: rows });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
