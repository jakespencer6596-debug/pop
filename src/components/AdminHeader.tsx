"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/cn";

/** Kingdom Ink top bar: white wordmark with a gold dot, gold active indicator. */
export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const onDashboard = pathname === "/";

  return (
    <header className="no-print sticky top-0 z-30 bg-ink">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <div className="flex h-full items-center gap-6">
          <Link
            href="/"
            className="focus-ring-dark font-display text-lg font-bold tracking-tight text-white"
          >
            POP<span className="text-gold">.</span>
          </Link>
          <nav aria-label="Primary" className="flex h-full items-stretch">
            <Link
              href="/"
              aria-current={onDashboard ? "page" : undefined}
              className={cn(
                "focus-ring-dark flex items-center border-b-2 px-1 text-sm font-medium transition-colors",
                onDashboard
                  ? "border-gold text-white"
                  : "border-transparent text-white/70 hover:text-white",
              )}
            >
              Tournaments
            </Link>
          </nav>
        </div>
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
