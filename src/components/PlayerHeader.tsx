"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Ink top bar for the player view: wordmark, tier label, and log out. */
export function PlayerHeader() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <header className="no-print sticky top-0 z-30 bg-ink">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <p className="flex items-center gap-2.5">
          <Image
            src="/brand/pop-mark.png"
            alt="POP"
            width={800}
            height={309}
            priority
            className="h-7 w-auto"
          />
          <span className="font-sans text-xs font-medium tracking-wider text-white/60 uppercase">
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
      <div className="h-0.5 bg-gradient-to-r from-gold via-gold/40 to-transparent" />
    </header>
  );
}
