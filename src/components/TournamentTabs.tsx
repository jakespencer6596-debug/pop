"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const tabs = [
  { slug: "", label: "Setup" },
  { slug: "players", label: "Players" },
  { slug: "payments", label: "Payments" },
  { slug: "schedule", label: "Schedule" },
  { slug: "scoring", label: "Scoring" },
  { slug: "standings", label: "Standings" },
  { slug: "money-round", label: "Money round" },
  { slug: "results", label: "Results" },
];

export function TournamentTabs({ tournamentId }: { tournamentId: string }) {
  const pathname = usePathname();
  const base = `/t/${tournamentId}`;

  return (
    <nav
      aria-label="Tournament sections"
      className="no-print -mx-4 overflow-x-auto px-4"
    >
      <div className="flex min-w-max gap-1 border-b border-line">
        {tabs.map((tab) => {
          const href = tab.slug ? `${base}/${tab.slug}` : base;
          const active =
            tab.slug === "" ? pathname === base : pathname === href;
          return (
            <Link
              key={tab.slug}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "focus-ring -mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-gold text-ink"
                  : "border-transparent text-muted hover:text-body",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
