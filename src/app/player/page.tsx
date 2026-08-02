import type { Metadata } from "next";
import Link from "next/link";
import { requirePlayerPage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCents, formatDate, plural } from "@/lib/format";
import { TournamentStatusBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlayerHeader } from "@/components/PlayerHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = { title: "Player home" };
export const dynamic = "force-dynamic";

export default async function PlayerHomePage() {
  await requirePlayerPage();
  const tournaments = await prisma.tournament.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: { _count: { select: { players: true } } },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <PlayerHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="font-display text-xl font-bold text-ink">Events</h1>
            <p className="mt-0.5 text-sm text-muted">
              Follow the live scoreboard and pay your entry fee. The organizer
              enters scores courtside.
            </p>
          </div>

          {tournaments.length === 0 ? (
            <EmptyState
              title="No events yet"
              description="Check back once the organizer creates a tournament."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {tournaments.map((t) => (
                <Card key={t.id} className="px-4 py-4 sm:px-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-[15px] font-semibold text-ink">
                      {t.name}
                    </span>
                    <TournamentStatusBadge status={t.status} />
                  </div>
                  <p className="mt-1 text-[13px] text-muted">
                    {formatDate(t.date)}
                    {t.venue ? ` at ${t.venue}` : ""} &middot;{" "}
                    {plural(t._count.players, "player")}
                    {t.entryFeeCents > 0
                      ? ` · ${formatCents(t.entryFeeCents)} entry`
                      : ""}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/live/${t.id}`}
                      className="focus-ring inline-flex h-9 items-center rounded-[8px] bg-brand px-3 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
                    >
                      Live scoreboard
                    </Link>
                    <Link
                      href={`/pay/${t.id}`}
                      className="focus-ring inline-flex h-9 items-center rounded-[8px] border border-line bg-surface px-3 text-sm font-medium text-ink transition-colors hover:border-muted"
                    >
                      Pay entry fee
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
