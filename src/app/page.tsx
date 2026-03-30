import { getUser } from "@/lib/auth";
import { getProperties, getAllRatings } from "@/lib/db";
import Gallery from "@/components/Gallery";
import Header from "@/components/Header";
import SeedButton from "@/components/SeedButton";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getUser();
  if (!user) redirect("/login");

  let properties: any[] = [];
  let allRatings: any[] = [];
  let dbReady = true;

  try {
    properties = await getProperties();
    allRatings = await getAllRatings();
  } catch {
    dbReady = false;
  }

  const myRatings: Record<number, { rating: string | null; notes: string }> = {};
  const partnerRatings: Record<number, { rating: string | null; notes: string; user_name: string }> = {};

  for (const r of allRatings) {
    if (r.user_name === user.name) {
      myRatings[r.property_id] = { rating: r.rating, notes: r.notes };
    } else {
      partnerRatings[r.property_id] = { rating: r.rating, notes: r.notes, user_name: r.user_name };
    }
  }

  if (!dbReady || properties.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Header userName={user.name} />
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
          <h2 className="text-xl font-semibold mb-3">
            {!dbReady ? "Database not connected" : "No properties yet"}
          </h2>
          <p className="text-zinc-400 mb-4 text-sm">
            {!dbReady
              ? "Add a Vercel Postgres database in your Vercel project settings, then seed it."
              : "Hit the button below to populate properties."}
          </p>
          <SeedButton />
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <Header userName={user.name} />
      <Gallery properties={properties} myRatings={myRatings} partnerRatings={partnerRatings} userName={user.name} />
    </main>
  );
}
