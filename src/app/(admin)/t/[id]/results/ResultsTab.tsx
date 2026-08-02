"use client";

import { useTournament } from "@/lib/useTournament";
import { formatCents, formatDate } from "@/lib/format";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StandingsTable } from "@/components/StandingsTable";

export function ResultsTab({ tournamentId }: { tournamentId: string }) {
  const { data, isLoading } = useTournament(tournamentId);

  if (isLoading || !data) {
    return <p className="py-8 text-center text-sm text-muted">Loading</p>;
  }

  if (!data.champion) {
    return (
      <EmptyState
        title="No results yet"
        description="Results appear when the money round finishes and a champion is decided."
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-[12px] border border-brand/40 bg-brand/5 px-5 py-6 text-center">
        <p className="text-xs font-semibold tracking-wide text-brand uppercase">
          Champion
        </p>
        <p className="mt-2 font-display text-3xl font-bold text-ink">
          {data.champion.name}
        </p>
        <p className="mt-1 text-sm text-muted">
          {data.name}
          {data.date ? `, ${formatDate(data.date)}` : ""}
          {data.venue ? ` at ${data.venue}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="px-4 py-3">
          <p className="text-xs font-medium text-muted">Entry fee</p>
          <p className="tnum mt-1 font-display text-xl font-bold text-ink">
            {formatCents(data.entryFeeCents)}
          </p>
        </Card>
        <Card className="px-4 py-3">
          <p className="text-xs font-medium text-muted">Prize pool</p>
          <p className="tnum mt-1 font-display text-xl font-bold text-ink">
            {formatCents(data.prizePoolCents)}
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader title="Money round placement" />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="pop-table">
              <thead>
                <tr>
                  <th className="num w-16">Place</th>
                  <th>Player</th>
                  <th className="num">Round 1 seed</th>
                </tr>
              </thead>
              <tbody>
                {data.placements.map((p) => (
                  <tr key={p.playerId}>
                    <td className="num font-semibold text-ink">{p.place}</td>
                    <td className="font-medium text-ink">{p.name}</td>
                    <td className="num">{p.seed ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Full Round 1 standings" />
        <StandingsTable
          rows={data.roundRobinStandings}
          advancingCount={data.numAdvancing}
        />
      </Card>
    </div>
  );
}
