"use client";

import Link from "next/link";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useTournament } from "@/lib/useTournament";
import type { RoundDTO } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { GameScoreCard } from "@/components/GameScoreCard";
import { StandingsTable } from "@/components/StandingsTable";

export function MoneyRoundTab({ tournamentId }: { tournamentId: string }) {
  const { data, mutate, isLoading } = useTournament(tournamentId, {
    poll: true,
  });
  const toast = useToast();
  const [confirmStart, setConfirmStart] = useState(false);
  const [busy, setBusy] = useState(false);

  if (isLoading || !data) {
    return <p className="py-8 text-center text-sm text-muted">Loading</p>;
  }

  const moneyRounds = data.rounds.filter((r) => r.phase === "MONEY_ROUND");
  const started = moneyRounds.length > 0;

  if (!started) {
    const contenders = data.roundRobinStandings.slice(0, data.numAdvancing);
    const formatLabel =
      data.moneyRoundFormat === "ROUND_ROBIN"
        ? `${data.moneyRoundMatchType === "SINGLES" ? "Singles" : "Doubles"} round robin`
        : `${data.moneyRoundMatchType === "SINGLES" ? "Singles" : "Doubles"} single elimination bracket`;

    return (
      <div className="flex flex-col gap-5">
        <Card>
          <CardHeader
            title="Super Money Round"
            description={`Format: ${formatLabel}. The top ${data.numAdvancing} from Round 1 advance, seeded by their standing.`}
          />
          <CardBody className="flex flex-col gap-4">
            {data.roundRobinComplete ? (
              <p className="text-sm text-positive">
                Round 1 is complete. The advancers below are locked in when you
                start the round.
              </p>
            ) : (
              <p className="text-sm text-body">
                {data.roundRobinGamesFinal} of {data.roundRobinGamesTotal} Round
                1 games are final. Every game needs a final score before the
                money round can start.{" "}
                <Link
                  href={`/t/${tournamentId}/scoring`}
                  className="focus-ring font-medium text-info"
                >
                  Finish scoring
                </Link>
              </p>
            )}
            <div>
              <Button
                disabled={!data.roundRobinComplete || busy}
                onClick={() => setConfirmStart(true)}
              >
                Start Money Round
              </Button>
            </div>
          </CardBody>
        </Card>

        {data.roundRobinGamesFinal > 0 && (
          <Card>
            <CardHeader
              title={`Projected top ${data.numAdvancing}`}
              description="Based on current Round 1 standings."
            />
            <StandingsTable
              rows={contenders}
              advancingCount={data.numAdvancing}
            />
          </Card>
        )}

        <ConfirmDialog
          open={confirmStart}
          title="Start the money round?"
          body={`This locks Round 1, seeds the top ${data.numAdvancing} players, and generates the ${formatLabel.toLowerCase()}.`}
          confirmLabel="Start"
          busy={busy}
          onCancel={() => setConfirmStart(false)}
          onConfirm={async () => {
            setBusy(true);
            try {
              await apiFetch(
                `/api/tournaments/${tournamentId}/money-round/start`,
                {
                  method: "POST",
                },
              );
              await mutate();
              toast("Money round started", "success");
              setConfirmStart(false);
            } catch (err) {
              toast(
                err instanceof Error ? err.message : "Could not start",
                "error",
              );
            } finally {
              setBusy(false);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {data.champion && (
        <div className="rounded-[12px] border border-brand/40 bg-brand/5 px-5 py-4">
          <p className="text-xs font-semibold tracking-wide text-brand uppercase">
            Champion
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-ink">
            {data.champion.name}
          </p>
          <Link
            href={`/t/${tournamentId}/results`}
            className="focus-ring mt-1 inline-block text-sm font-medium text-info"
          >
            View final results
          </Link>
        </div>
      )}

      {data.moneyRoundFormat === "ROUND_ROBIN" ? (
        <RoundRobinMoney
          rounds={moneyRounds}
          onChanged={mutate}
          standings={data.moneyRoundStandings ?? []}
        />
      ) : (
        <BracketMoney rounds={moneyRounds} onChanged={mutate} />
      )}
    </div>
  );
}

function RoundRobinMoney({
  rounds,
  standings,
  onChanged,
}: {
  rounds: RoundDTO[];
  standings: React.ComponentProps<typeof StandingsTable>["rows"];
  onChanged: () => Promise<unknown>;
}) {
  return (
    <>
      <Card>
        <CardHeader
          title="Money round standings"
          description="Same tiebreaks as Round 1, counting only money round games."
        />
        <StandingsTable rows={standings} />
      </Card>
      {rounds.map((round) => {
        const complete = round.games.every((g) => g.status === "FINAL");
        return (
          <section key={round.id} className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-sm font-semibold text-ink">
                Wave {round.number}
              </h3>
              {complete && <Badge tone="positive">Complete</Badge>}
            </div>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {round.games.map((game) => (
                <GameScoreCard
                  key={game.id}
                  game={game}
                  onChanged={onChanged}
                />
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}

function BracketMoney({
  rounds,
  onChanged,
}: {
  rounds: RoundDTO[];
  onChanged: () => Promise<unknown>;
}) {
  const labelFor = (index: number, total: number) => {
    if (index === total - 1) return "Final";
    if (index === total - 2) return "Semifinals";
    if (index === total - 3) return "Quarterfinals";
    return `Round ${index + 1}`;
  };

  return (
    <div className="flex flex-col gap-5">
      {rounds.map((round, i) => (
        <section key={round.id} className="flex flex-col gap-3">
          <h3 className="font-display text-sm font-semibold text-ink">
            {labelFor(i, rounds.length)}
          </h3>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {round.games.map((game) => (
              <GameScoreCard key={game.id} game={game} onChanged={onChanged} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
