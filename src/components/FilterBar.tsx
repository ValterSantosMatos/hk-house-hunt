"use client";

interface FilterBarProps {
  current: string;
  onChange: (filter: string) => void;
  counts: Record<string, number>;
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "listing", label: "Listings" },
  { key: "transaction", label: "Transactions" },
  { key: "liked", label: "Liked" },
  { key: "starred", label: "Starred" },
  { key: "great-deal", label: "Great Deals" },
  { key: "good-deal", label: "Good Deals" },
  { key: "both-like", label: "Both Like" },
];

export default function FilterBar({ current, onChange, counts }: FilterBarProps) {
  return (
    <div className="flex gap-2 flex-wrap p-4 bg-zinc-900/80 rounded-xl border border-zinc-800">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition ${
            current === f.key
              ? "bg-indigo-600 border-indigo-500 text-white"
              : "border-zinc-800 text-zinc-400 hover:bg-white/5"
          }`}
        >
          {f.label}
          {counts[f.key] !== undefined && (
            <span className="ml-1.5 text-[10px] opacity-60">{counts[f.key]}</span>
          )}
        </button>
      ))}
    </div>
  );
}
