import { neon } from "@neondatabase/serverless";

function getSQL() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL or POSTGRES_URL env var is required");
  return neon(databaseUrl);
}

export async function initDB() {
  const sql = getSQL();
  await sql`
    CREATE TABLE IF NOT EXISTS properties (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      phase TEXT NOT NULL,
      estate TEXT NOT NULL,
      property_type TEXT NOT NULL,
      beds INTEGER,
      baths INTEGER,
      gross_sqft INTEGER,
      net_sqft INTEGER,
      price BIGINT,
      psf_gross INTEGER,
      psf_net INTEGER,
      deal_score INTEGER DEFAULT 0,
      status TEXT DEFAULT 'listing',
      features JSONB DEFAULT '[]',
      listing_urls JSONB DEFAULT '[]',
      image_url TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS ratings (
      id SERIAL PRIMARY KEY,
      property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
      user_name TEXT NOT NULL,
      rating TEXT,
      notes TEXT DEFAULT '',
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(property_id, user_name)
    )
  `;
}

export interface Property {
  id: number;
  slug: string;
  name: string;
  phase: string;
  estate: string;
  property_type: string;
  beds: number;
  baths: number;
  gross_sqft: number;
  net_sqft: number | null;
  price: number;
  psf_gross: number;
  psf_net: number | null;
  deal_score: number;
  status: string;
  features: string[];
  listing_urls: { site: string; url: string }[];
  image_url: string | null;
  created_at: string;
}

export interface Rating {
  id: number;
  property_id: number;
  user_name: string;
  rating: string | null;
  notes: string;
  updated_at: string;
}

export async function getProperties() {
  const sql = getSQL();
  const rows = await sql`SELECT * FROM properties ORDER BY deal_score DESC`;
  return rows as Property[];
}

export async function getRatings(userName: string) {
  const sql = getSQL();
  const rows = await sql`SELECT * FROM ratings WHERE user_name = ${userName}`;
  return rows as Rating[];
}

export async function getAllRatings() {
  const sql = getSQL();
  const rows = await sql`SELECT * FROM ratings`;
  return rows as Rating[];
}

export async function upsertRating(propertyId: number, userName: string, rating: string | null, notes: string) {
  const sql = getSQL();
  await sql`
    INSERT INTO ratings (property_id, user_name, rating, notes, updated_at)
    VALUES (${propertyId}, ${userName}, ${rating}, ${notes}, NOW())
    ON CONFLICT (property_id, user_name)
    DO UPDATE SET rating = ${rating}, notes = ${notes}, updated_at = NOW()
  `;
}
