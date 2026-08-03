import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/cn";
import { formatDate, plural } from "@/lib/format";
import { TournamentStatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Tournaments" };
export const dynamic = "force-dynamic";

const statusStripe: Record<string, string> = {
  SETUP: "bg-muted",
  ROUND_ROBIN: "bg-brand",
  MONEY_ROUND: "bg-gold",
  COMPLETED: "bg-positive",
};

export default async function DashboardPage() {
  const tournaments = await prisma.tournament.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: { _count: { select: { players: true } } },
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-ink">
            Tournaments
          </h1>
          <p className="mt-0.5 text-sm text-muted">
            Every event you run, current and past.
          </p>
        </div>
        <Link
          href="/new"
          className="focus-ring inline-flex h-10 items-center rounded-[8px] bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
        >
          Create tournament
        </Link>
      </div>

      {tournaments.length === 0 ? (
        <EmptyState
          title="No tournaments yet"
          description="Create your first tournament to add players and generate a schedule."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {tournaments.map((t) => (
            <Link
              key={t.id}
              href={`/t/${t.id}`}
              className="focus-ring group flex overflow-hidden rounded-[12px] border border-line bg-surface shadow-[0_1px_2px_rgba(16,24,32,0.04)] transition-all hover:-translate-y-0.5 hover:border-muted hover:shadow-[0_6px_16px_rgba(16,24,32,0.08)]"
            >
              <span
                className={cn(
                  "w-1 shrink-0 self-stretch",
                  statusStripe[t.status] ?? "bg-muted",
                )}
              />
              <span className="flex flex-1 flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-[15px] font-semibold text-ink">
                      {t.name}
                    </span>
                    <TournamentStatusBadge status={t.status} />
                  </span>
                  <span className="mt-1 block text-[13px] text-muted">
                    {formatDate(t.date)}
                    {t.venue ? ` at ${t.venue}` : ""} &middot;{" "}
                    {plural(t._count.players, "player")}
                  </span>
                </span>
                <span className="text-sm font-medium text-info group-hover:underline">
                  Open
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
