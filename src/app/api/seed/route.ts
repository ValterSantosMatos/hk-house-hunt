import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { initDB } from "@/lib/db";
import { SEED_PROPERTIES } from "@/lib/properties-data";

export async function POST() {
  try {
    await initDB();

    for (const p of SEED_PROPERTIES) {
      await sql`
        INSERT INTO properties (slug, name, phase, estate, property_type, beds, baths, gross_sqft, net_sqft, price, psf_gross, psf_net, deal_score, status, features, listing_urls, image_url)
        VALUES (${p.slug}, ${p.name}, ${p.phase}, ${p.estate}, ${p.property_type}, ${p.beds}, ${p.baths}, ${p.gross_sqft}, ${p.net_sqft}, ${p.price}, ${p.psf_gross}, ${p.psf_net}, ${p.deal_score}, ${p.status}, ${JSON.stringify(p.features)}, ${JSON.stringify(p.listing_urls)}, ${p.image_url})
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          phase = EXCLUDED.phase,
          price = EXCLUDED.price,
          psf_gross = EXCLUDED.psf_gross,
          psf_net = EXCLUDED.psf_net,
          deal_score = EXCLUDED.deal_score,
          features = EXCLUDED.features,
          listing_urls = EXCLUDED.listing_urls
      `;
    }

    return NextResponse.json({ ok: true, count: SEED_PROPERTIES.length });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
