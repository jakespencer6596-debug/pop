import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, plural } from "@/lib/format";
import { TournamentStatusBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Tournaments" };
export const dynamic = "force-dynamic";

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
            <Card key={t.id} className="transition-colors hover:border-muted">
              <Link
                href={`/t/${t.id}`}
                className="focus-ring flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5"
              >
                <div className="min-w-0">
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
                  </p>
                </div>
                <span className="text-sm font-medium text-info">Open</span>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
