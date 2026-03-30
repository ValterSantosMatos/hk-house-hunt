"use client";

export default function Header({ userName }: { userName: string }) {
  async function handleSignOut() {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.href = "/login";
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold">House Hunt HK</h1>
        <p className="text-zinc-400 text-sm">Discovery Bay · Rate properties with your partner</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-500">Hi, <strong className="text-white">{userName}</strong></span>
        <button onClick={handleSignOut} className="px-4 py-2 rounded-lg border border-zinc-800 text-zinc-400 text-sm hover:bg-white/5 transition">
          Sign out
        </button>
      </div>
    </div>
  );
}
