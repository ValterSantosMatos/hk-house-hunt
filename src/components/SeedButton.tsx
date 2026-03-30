"use client";

import { useState } from "react";

export default function SeedButton() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSeed() {
    setLoading(true);
    try {
      await fetch("/api/seed", { method: "POST" });
      setDone(true);
      window.location.reload();
    } catch {
      alert("Failed to seed database");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleSeed} disabled={loading || done}
      className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition disabled:opacity-50">
      {loading ? "Seeding..." : done ? "Done! Reloading..." : "Seed Database"}
    </button>
  );
}
