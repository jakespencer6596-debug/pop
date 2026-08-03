"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { usePublicTournament } from "@/lib/useTournament";
import type { GameDTO, RoundDTO, TournamentPublicDTO } from "@/lib/types";
import { SiteFooter } from "@/components/SiteFooter";
import { StandingsTable } from "@/components/StandingsTable";

type View = "standings" | "matchups" | "money";

export function LiveView({ tournamentId }: { tournamentId: string }) {
  const { data, isLoading } = usePublicTournament(tournamentId);
  const [view, setView] = useState<View>("standings");

  if (isLoading || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-night">
        <p className="text-sm text-night-muted">Loading</p>
      </main>
    );
  }

  const moneyStarted = data.rounds.some((r) => r.phase === "MONEY_ROUND");
  const statusLine = statusText(data);

  return (
    <div className="flex min-h-screen flex-col bg-night">
      <main className="flex-1 pb-10 text-white">
        <header className="px-4 py-4 sm:px-8 sm:py-5">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-end justify-between gap-3">
            <div>
              <p className="flex items-center gap-2.5">
                <Image
                  src="/brand/pop-mark.png"
                  alt="POP"
                  width={800}
                  height={309}
                  priority
                  className="h-6 w-auto"
                />
                <span className="font-sans text-xs font-medium text-night-muted uppercase tracking-wider">
                  Live
                </span>
              </p>
              <h1 className="mt-1.5 font-display text-3xl font-bold sm:text-4xl">
                {data.name}
              </h1>
              <p className="mt-1.5 flex items-center gap-2 text-sm text-night-muted">
                {(data.status === "ROUND_ROBIN" ||
                  data.status === "MONEY_ROUND") && (
                  <span className="relative inline-flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
                  </span>
                )}
                {statusLine}
              </p>
            </div>
            <nav
              className="flex gap-1 rounded-[8px] border border-white/10 bg-night-surface p-1"
              aria-label="Live views"
            >
              {(
                [
                  ["standings", "Standings"],
                  ["matchups", "Matchups"],
                  ["money", "Money round"],
                ] as Array<[View, string]>
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setView(key)}
                  aria-pressed={view === key}
                  className={cn(
                    "focus-ring-dark rounded-[6px] px-3 py-1.5 text-sm font-medium transition-colors",
                    view === key
                      ? "bg-gold text-ink"
                      : "text-night-muted hover:text-white",
                  )}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </header>
        <div className="h-0.5 bg-gradient-to-r from-gold via-gold/40 to-transparent" />

        <div className="mx-auto w-full max-w-6xl px-4 sm:px-8">
          {data.status === "COMPLETED" && data.champion && (
            <div className="mt-6 rounded-[12px] border border-gold/60 bg-[radial-gradient(circle_at_50%_0%,rgba(249,224,29,0.16),rgba(249,224,29,0.04)_70%)] px-6 py-7 text-center">
              <p className="font-display text-xs font-semibold tracking-[0.2em] text-gold">
                Champion
              </p>
              <p className="mt-2 font-display text-4xl font-bold sm:text-5xl">
                {data.champion.name}
              </p>
              {data.placements.length > 1 && (
                <p className="mt-2 text-sm text-night-muted">
                  Runner-up: {data.placements.find((p) => p.place === 2)?.name}
                </p>
              )}
            </div>
          )}

          <div className="mt-6">
            {view === "standings" && <StandingsView data={data} />}
            {view === "matchups" && <MatchupsView data={data} />}
            {view === "money" && (
              <MoneyView data={data} started={moneyStarted} />
            )}
          </div>
        </div>
      </main>
      <SiteFooter dark />
    </div>
  );
}

function statusText(data: TournamentPublicDTO): string {
  switch (data.status) {
    case "SETUP":
      return "Warming up. The schedule is not out yet.";
    case "ROUND_ROBIN":
      return `Round 1: ${data.roundRobinGamesFinal} of ${data.roundRobinGamesTotal} games final`;
    case "MONEY_ROUND":
      return "Super Money Round in progress";
    case "COMPLETED":
      return "Final";
  }
}

function StandingsView({ data }: { data: TournamentPublicDTO }) {
  if (data.roundRobinGamesTotal === 0) {
    return (
      <p className="py-10 text-center text-sm text-night-muted">
        Standings appear when Round 1 begins.
      </p>
    );
  }
  return (
    <section className="overflow-hidden rounded-[12px] border border-white/10 bg-night-surface">
      <div className="border-b border-white/10 px-5 py-3">
        <h2 className="font-display text-sm font-semibold">
          Round 1 standings
        </h2>
        <p className="mt-0.5 text-xs text-night-muted">
          Top {data.numAdvancing} advance to the Super Money Round
        </p>
      </div>
      <StandingsTable
        rows={data.roundRobinStandings}
        advancingCount={data.numAdvancing}
        dark
      />
    </section>
  );
}

function MatchupsView({ data }: { data: TournamentPublicDTO }) {
  const rrRounds = data.rounds.filter((r) => r.phase === "ROUND_ROBIN");
  const current =
    rrRounds.find((r) => r.games.some((g) => g.status !== "FINAL")) ??
    rrRounds[rrRounds.length - 1];

  if (!current) {
    return (
      <p className="py-10 text-center text-sm text-night-muted">
        Matchups appear when the schedule is out.
      </p>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-sm font-semibold">
        Round {current.number} of {rrRounds.length}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {current.games.map((game) => (
          <GamePanel key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}

function MoneyView({
  data,
  started,
}: {
  data: TournamentPublicDTO;
  started: boolean;
}) {
  if (!started) {
    return (
      <p className="py-10 text-center text-sm text-night-muted">
        The Super Money Round starts when Round 1 wraps up. The top{" "}
        {data.numAdvancing} players advance.
      </p>
    );
  }
  const moneyRounds = data.rounds.filter((r) => r.phase === "MONEY_ROUND");

  if (data.moneyRoundFormat === "ROUND_ROBIN") {
    return (
      <section className="flex flex-col gap-4">
        <div className="overflow-hidden rounded-[12px] border border-white/10 bg-night-surface">
          <div className="border-b border-white/10 px-5 py-3">
            <h2 className="font-display text-sm font-semibold">
              Money round standings
            </h2>
          </div>
          <StandingsTable rows={data.moneyRoundStandings ?? []} dark />
        </div>
        {moneyRounds.map((round) => (
          <div key={round.id} className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold tracking-wide text-night-muted uppercase">
              Wave {round.number}
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {round.games.map((game) => (
                <GamePanel key={game.id} game={game} />
              ))}
            </div>
          </div>
        ))}
      </section>
    );
  }

  return <BracketPanel rounds={moneyRounds} />;
}

function BracketPanel({ rounds }: { rounds: RoundDTO[] }) {
  const labelFor = (index: number, total: number) => {
    if (index === total - 1) return "Final";
    if (index === total - 2) return "Semifinals";
    if (index === total - 3) return "Quarterfinals";
    return `Round ${index + 1}`;
  };
  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <div className="flex min-w-max items-stretch gap-4">
        {rounds.map((round, i) => (
          <div key={round.id} className="flex w-64 flex-col gap-3">
            <h3 className="text-xs font-semibold tracking-wide text-night-muted uppercase">
              {labelFor(i, rounds.length)}
            </h3>
            <div className="flex flex-1 flex-col justify-around gap-3">
              {round.games.map((game) => (
                <GamePanel key={game.id} game={game} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GamePanel({ game }: { game: GameDTO }) {
  const final = game.status === "FINAL";
  const aWon =
    final && game.scoreA !== null && game.scoreB !== null
      ? game.scoreA > game.scoreB
      : null;

  return (
    <div className="rounded-[12px] border border-white/10 bg-night-surface px-4 py-3">
      <div className="flex items-center justify-between text-xs text-night-muted">
        <span>{game.court !== null ? `Court ${game.court}` : ""}</span>
        <span
          className={cn(
            final && "font-semibold text-night-win",
            game.status === "IN_PROGRESS" && "font-semibold text-gold",
          )}
        >
          {final ? "Final" : game.status === "IN_PROGRESS" ? "Live" : ""}
        </span>
      </div>
      <div className="mt-2 flex flex-col gap-1.5">
        <TeamLine
          names={game.teamA.map((p) => p.name)}
          score={game.scoreA}
          won={aWon === true}
        />
        <TeamLine
          names={game.teamB.map((p) => p.name)}
          score={game.scoreB}
          won={aWon === false}
        />
      </div>
    </div>
  );
}

function TeamLine({
  names,
  score,
  won,
}: {
  names: string[];
  score: number | null;
  won: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span
        className={cn(
          "min-w-0 truncate text-sm",
          won ? "font-semibold text-night-win" : "text-white",
          names.length === 0 && "text-night-muted",
        )}
      >
        {names.length === 0 ? "To be decided" : names.join(" and ")}
      </span>
      <span
        className={cn(
          "tnum font-display text-xl font-bold",
          won ? "text-night-win" : "text-white",
        )}
      >
        {score ?? ""}
      </span>
    </div>
  );
}
