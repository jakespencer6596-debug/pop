"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { useTournament } from "@/lib/useTournament";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { GameScoreCard } from "@/components/GameScoreCard";
import { StandingsTable } from "@/components/StandingsTable";

export function ScoringTab({ tournamentId }: { tournamentId: string }) {
  const { data, mutate, isLoading } = useTournament(tournamentId, {
    poll: true,
  });
  const [selected, setSelected] = useState<number | null>(null);

  if (isLoading || !data) {
    return <p className="py-8 text-center text-sm text-muted">Loading</p>;
  }

  const rrRounds = data.rounds.filter((r) => r.phase === "ROUND_ROBIN");
  if (rrRounds.length === 0) {
    return (
      <EmptyState
        title="Nothing to score yet"
        description="Generate the Round 1 schedule first."
        action={
          <Link
            href={`/t/${tournamentId}/schedule`}
            className="focus-ring text-sm font-medium text-info"
          >
            Go to the schedule
          </Link>
        }
      />
    );
  }

  // Default to the first round that still has open games.
  const firstOpen =
    rrRounds.find((r) => r.games.some((g) => g.status !== "FINAL"))?.number ??
    rrRounds[rrRounds.length - 1].number;
  const activeNumber = selected ?? firstOpen;
  const activeRound =
    rrRounds.find((r) => r.number === activeNumber) ?? rrRounds[0];

  const done = data.roundRobinGamesFinal;
  const total = data.roundRobinGamesTotal;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex flex-wrap gap-1.5"
          role="tablist"
          aria-label="Rounds"
        >
          {rrRounds.map((round) => {
            const complete = round.games.every((g) => g.status === "FINAL");
            const active = round.number === activeRound.number;
            return (
              <button
                key={round.id}
                role="tab"
                aria-selected={active}
                onClick={() => setSelected(round.number)}
                className={cn(
                  "focus-ring h-9 rounded-[8px] border px-3 text-sm font-medium transition-colors",
                  active
                    ? "border-gold bg-gold text-ink"
                    : complete
                      ? "border-line bg-surface text-positive"
                      : "border-line bg-surface text-body hover:border-muted",
                )}
              >
                R{round.number}
              </button>
            );
          })}
        </div>
        <p className="tnum text-sm text-muted">
          {done} of {total} games final
        </p>
      </div>

      {data.roundRobinComplete && (
        <div className="rounded-[8px] border border-positive/30 bg-positive/5 px-4 py-3 text-sm text-positive">
          Round 1 is complete.{" "}
          <Link
            href={`/t/${tournamentId}/money-round`}
            className="focus-ring font-semibold underline"
          >
            Start the money round
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {activeRound.games.map((game) => (
          <GameScoreCard key={game.id} game={game} onChanged={mutate} />
        ))}
      </div>

      <Card>
        <CardHeader
          title="Round 1 standings"
          description="Updates as games are finalized. Top players advance to the money round."
        />
        <StandingsTable
          rows={data.roundRobinStandings}
          advancingCount={data.numAdvancing}
        />
      </Card>
    </div>
  );
}
