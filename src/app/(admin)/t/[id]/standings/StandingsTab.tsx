"use client";

import { useTournament } from "@/lib/useTournament";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StandingsTable } from "@/components/StandingsTable";

export function StandingsTab({ tournamentId }: { tournamentId: string }) {
  const { data, isLoading } = useTournament(tournamentId, { poll: true });

  if (isLoading || !data) {
    return <p className="py-8 text-center text-sm text-muted">Loading</p>;
  }

  if (data.roundRobinGamesTotal === 0) {
    return (
      <EmptyState
        title="No standings yet"
        description="Standings appear once the schedule exists and games are scored."
      />
    );
  }

  return (
    <Card>
      <CardHeader
        title="Round 1 leaderboard"
        description={`Ranked by wins, then point differential, then points for. The top ${data.numAdvancing} advance to the money round.`}
      />
      <StandingsTable
        rows={data.roundRobinStandings}
        advancingCount={data.numAdvancing}
      />
    </Card>
  );
}
