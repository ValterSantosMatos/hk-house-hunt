"use client";

import { useState } from "react";

interface PropertyCardProps {
  property: {
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
  };
  myRating?: { rating: string | null; notes: string };
  partnerRating?: { rating: string | null; notes: string; user_name: string } | null;
}

function formatPrice(n: number) {
  if (n >= 1000000) return `HK$${(n / 1000000).toFixed(1)}M`;
  return `HK$${n.toLocaleString()}`;
}

function getDealBadge(score: number, status: string) {
  if (status === "transaction") return { label: "Transaction", cls: "bg-indigo-500 text-white" };
  if (score >= 20) return { label: `Great Deal +${score}%`, cls: "bg-emerald-500 text-black" };
  if (score >= 10) return { label: `Good Deal +${score}%`, cls: "bg-yellow-400 text-black" };
  if (score > 0) return { label: `+${score}% below mkt`, cls: "bg-orange-400 text-black" };
  if (score < -10) return { label: `${Math.abs(score)}% above mkt`, cls: "bg-red-500 text-white" };
  return null;
}

export default function PropertyCard({ property: p, myRating: initial, partnerRating }: PropertyCardProps) {
  const [rating, setRating] = useState(initial?.rating || null);
  const [notes, setNotes] = useState(initial?.notes || "");
  const [saving, setSaving] = useState(false);

  async function handleRate(newRating: string) {
    const value = rating === newRating ? null : newRating;
    setRating(value);
    setSaving(true);
    try {
      await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: p.id, rating: value, notes }),
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleNotes() {
    await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId: p.id, rating, notes }),
    });
  }

  const badge = getDealBadge(p.deal_score, p.status);
  const borderClass = rating === "like" ? "border-emerald-500/50" : rating === "star" ? "border-yellow-400/50" : rating === "dislike" ? "border-red-500/30 opacity-60" : "border-zinc-800";

  return (
    <div className={`rounded-2xl border ${borderClass} bg-zinc-900/80 overflow-hidden transition-all hover:translate-y-[-2px] hover:shadow-xl hover:shadow-black/30`}>
      {/* Image / placeholder */}
      <div className="h-48 bg-zinc-800/60 flex items-center justify-center relative">
        {badge && (
          <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-semibold ${badge.cls}`}>
            {badge.label}
          </span>
        )}
        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-[11px] font-medium bg-black/60 text-white">
          {p.beds}BR / {p.baths}BA · {p.property_type}
        </span>
        <div className="text-center text-zinc-500 px-6">
          <div className="text-4xl mb-2">🏠</div>
          <div className="text-xs">
            {p.listing_urls.map((u, i) => (
              <span key={i}>
                {i > 0 && " · "}
                <a href={u.url} target="_blank" rel="noopener" className="text-indigo-400 hover:underline">
                  {u.site}
                </a>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Name */}
        <div>
          <h3 className="font-semibold text-[15px] leading-tight">{p.name}</h3>
          <p className="text-zinc-500 text-xs mt-0.5">{p.phase} · {p.estate} · Discovery Bay</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">Price</div>
            <div className="text-sm font-semibold text-emerald-400">{formatPrice(p.price)}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">$/sqft</div>
            <div className="text-sm font-semibold">HK${p.psf_gross?.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">Gross</div>
            <div className="text-sm font-semibold">{p.gross_sqft} sqft</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">Net</div>
            <div className="text-sm font-semibold">{p.net_sqft ? `${p.net_sqft} sqft` : "N/A"}</div>
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5">
          {(p.features || []).map((f: string, i: number) => (
            <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-300">
              {f}
            </span>
          ))}
        </div>

        {/* Listing links */}
        <div className="flex gap-2">
          {p.listing_urls.map((u: { site: string; url: string }, i: number) => (
            <a key={i} href={u.url} target="_blank" rel="noopener"
              className="px-2.5 py-1 rounded-md text-xs bg-white/5 border border-zinc-800 text-indigo-400 hover:bg-indigo-500/10 transition">
              {u.site} →
            </a>
          ))}
        </div>

        {/* Partner rating indicator */}
        {partnerRating && partnerRating.rating && (
          <div className="text-xs text-zinc-500 border border-zinc-800 rounded-lg px-3 py-2 bg-zinc-800/30">
            <span className="font-medium text-zinc-400">{partnerRating.user_name}</span>
            {" rated "}
            <span className={partnerRating.rating === "star" ? "text-yellow-400" : partnerRating.rating === "like" ? "text-emerald-400" : "text-red-400"}>
              {partnerRating.rating === "star" ? "⭐" : partnerRating.rating === "like" ? "👍" : "👎"}
            </span>
            {partnerRating.notes && <span className="ml-1 text-zinc-500">— &ldquo;{partnerRating.notes}&rdquo;</span>}
          </div>
        )}

        {/* Rating buttons */}
        <div className="flex gap-2">
          <button onClick={() => handleRate("like")} disabled={saving}
            className={`flex-1 py-2.5 rounded-lg border text-lg transition ${rating === "like" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50" : "border-zinc-800 text-zinc-500 hover:bg-white/5"}`}>
            👍
          </button>
          <button onClick={() => handleRate("dislike")} disabled={saving}
            className={`flex-1 py-2.5 rounded-lg border text-lg transition ${rating === "dislike" ? "bg-red-500/20 text-red-400 border-red-500/50" : "border-zinc-800 text-zinc-500 hover:bg-white/5"}`}>
            👎
          </button>
          <button onClick={() => handleRate("star")} disabled={saving}
            className={`flex-1 py-2.5 rounded-lg border text-lg transition ${rating === "star" ? "bg-yellow-400/20 text-yellow-400 border-yellow-400/50" : "border-zinc-800 text-zinc-500 hover:bg-white/5"}`}>
            ⭐
          </button>
        </div>

        {/* Notes */}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleNotes}
          placeholder="Notes (what do you like/dislike?)"
          className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-black/20 text-xs text-zinc-300 placeholder-zinc-600 resize-none focus:outline-none focus:border-indigo-500/50 transition"
          rows={2}
        />
      </div>
    </div>
  );
}
