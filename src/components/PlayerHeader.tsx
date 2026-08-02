"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Ink top bar for the player view: wordmark, tier label, and log out. */
export function PlayerHeader() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <header className="no-print sticky top-0 z-30 bg-ink">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <p className="font-display text-lg font-bold tracking-tight text-white">
          POP<span className="text-gold">.</span>
          <span className="ml-2 font-sans text-xs font-medium tracking-wider text-white/60 uppercase">
            Player view
          </span>
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
            router.refresh();
          }}
          className="focus-ring-dark h-8 rounded-[8px] px-3 text-sm font-medium text-white/70 transition-colors hover:text-white disabled:opacity-50"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
