"use client";

import { useState } from "react";
import PropertyCard from "./PropertyCard";
import FilterBar from "./FilterBar";

interface GalleryProps {
  properties: any[];
  myRatings: Record<number, { rating: string | null; notes: string }>;
  partnerRatings: Record<number, { rating: string | null; notes: string; user_name: string }>;
  userName: string;
}

export default function Gallery({ properties, myRatings, partnerRatings, userName }: GalleryProps) {
  const [filter, setFilter] = useState("all");

  const filtered = properties.filter((p) => {
    const myR = myRatings[p.id]?.rating;
    const partnerR = partnerRatings[p.id]?.rating;
    switch (filter) {
      case "listing": return p.status === "listing";
      case "transaction": return p.status === "transaction";
      case "liked": return myR === "like" || myR === "star";
      case "starred": return myR === "star";
      case "great-deal": return p.deal_score >= 20;
      case "good-deal": return p.deal_score >= 10 && p.deal_score < 20;
      case "both-like": return (myR === "like" || myR === "star") && (partnerR === "like" || partnerR === "star");
      default: return true;
    }
  });

  const counts: Record<string, number> = {
    all: properties.length,
    listing: properties.filter(p => p.status === "listing").length,
    transaction: properties.filter(p => p.status === "transaction").length,
    liked: properties.filter(p => { const r = myRatings[p.id]?.rating; return r === "like" || r === "star"; }).length,
    starred: properties.filter(p => myRatings[p.id]?.rating === "star").length,
    "great-deal": properties.filter(p => p.deal_score >= 20).length,
    "good-deal": properties.filter(p => p.deal_score >= 10 && p.deal_score < 20).length,
    "both-like": properties.filter(p => {
      const myR = myRatings[p.id]?.rating;
      const partnerR = partnerRatings[p.id]?.rating;
      return (myR === "like" || myR === "star") && (partnerR === "like" || partnerR === "star");
    }).length,
  };

  return (
    <div className="space-y-5">
      <FilterBar current={filter} onChange={setFilter} counts={counts} />

      {/* Summary */}
      <div className="flex gap-4 flex-wrap text-sm text-zinc-400">
        <span><strong className="text-white">{properties.length}</strong> properties</span>
        <span className="text-emerald-400">⭐ {counts.starred} starred</span>
        <span className="text-emerald-400">👍 {counts.liked} liked</span>
        <span className="text-yellow-400">💑 {counts["both-like"]} both like</span>
        <span className="text-zinc-500">Logged in as <strong className="text-white">{userName}</strong></span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((p) => (
          <PropertyCard
            key={p.id}
            property={p}
            myRating={myRatings[p.id]}
            partnerRating={partnerRatings[p.id] || null}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-zinc-500">
          No properties match this filter.
        </div>
      )}
    </div>
  );
}
