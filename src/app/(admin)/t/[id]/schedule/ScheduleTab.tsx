"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useTournament } from "@/lib/useTournament";
import type { GameDTO } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";

export function ScheduleTab({ tournamentId }: { tournamentId: string }) {
  const { data, mutate, isLoading } = useTournament(tournamentId);
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);

  if (isLoading || !data) {
    return <p className="py-8 text-center text-sm text-muted">Loading</p>;
  }

  const rrRounds = data.rounds.filter((r) => r.phase === "ROUND_ROBIN");
  const hasSchedule = rrRounds.length > 0;
  const fieldOk = data.players.length >= 4 && data.players.length % 4 === 0;
  const moneyStarted = data.rounds.some((r) => r.phase === "MONEY_ROUND");

  async function generate(seed?: number) {
    setBusy(true);
    try {
      await apiFetch(`/api/tournaments/${tournamentId}/schedule/generate`, {
        method: "POST",
        body: seed ? { seed } : {},
      });
      await mutate();
      toast("Schedule generated", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not generate", "error");
    } finally {
      setBusy(false);
      setConfirmRegenerate(false);
    }
  }

  if (!hasSchedule) {
    return (
      <EmptyState
        title="No schedule yet"
        description={
          fieldOk
            ? `Generate ${data.roundRobinGames} rounds of rotating-partner doubles for ${data.players.length} players on ${data.numCourts} courts.`
            : `The field has ${data.players.length} players. Round 1 needs a multiple of 4 before a schedule can be generated.`
        }
        action={
          <Button onClick={() => generate()} disabled={!fieldOk || busy}>
            {busy ? "Generating" : "Generate schedule"}
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {rrRounds.length} rounds, partners rotate every round.
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            Print
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={moneyStarted}
            onClick={() => setConfirmRegenerate(true)}
          >
            Regenerate
          </Button>
        </div>
      </div>

      {rrRounds.map((round) => (
        <Card key={round.id}>
          <CardHeader title={`Round ${round.number}`} />
          <div className="overflow-x-auto">
            <table className="pop-table">
              <thead>
                <tr>
                  <th className="w-20">Court</th>
                  <th>Team A</th>
                  <th>Team B</th>
                </tr>
              </thead>
              <tbody>
                {round.games.map((game) => (
                  <tr key={game.id}>
                    <td className="num font-semibold text-ink">{game.court}</td>
                    <td>{teamNames(game, "A")}</td>
                    <td>{teamNames(game, "B")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ))}

      <ConfirmDialog
        open={confirmRegenerate}
        title="Regenerate the schedule?"
        body="This replaces every Round 1 matchup and clears any Round 1 scores already entered."
        confirmLabel="Regenerate"
        destructive
        busy={busy}
        onCancel={() => setConfirmRegenerate(false)}
        onConfirm={() => generate(Math.floor(Math.random() * 999000) + 1)}
      />
    </div>
  );
}

function teamNames(game: GameDTO, side: "A" | "B"): string {
  const team = side === "A" ? game.teamA : game.teamB;
  return team.map((p) => p.name).join(" and ");
}
