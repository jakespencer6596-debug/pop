import { requireAdminApi } from "@/lib/auth";
import {
  generateRotatingDoubles,
  generateSinglesRoundRobin,
  planBracket,
} from "@/lib/engine/moneyRound";
import { computeStandings, selectAdvancers } from "@/lib/engine/standings";
import { prisma } from "@/lib/prisma";
import { getTournamentDetail } from "@/lib/tournament";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Context) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;
  const detail = await getTournamentDetail(id);
  if (!detail) {
    return Response.json({ error: "Tournament not found" }, { status: 404 });
  }
  if (detail.rounds.some((r) => r.phase === "MONEY_ROUND")) {
    return Response.json(
      { error: "The money round has already started." },
      { status: 409 },
    );
  }
  if (detail.roundRobinGamesTotal === 0) {
    return Response.json(
      { error: "Generate and play Round 1 first." },
      { status: 409 },
    );
  }
  if (!detail.roundRobinComplete) {
    const left = detail.roundRobinGamesTotal - detail.roundRobinGamesFinal;
    return Response.json(
      {
        error: `Round 1 is not finished. ${left} ${left === 1 ? "game" : "games"} still need a final score.`,
      },
      { status: 409 },
    );
  }
  if (detail.numAdvancing > detail.players.length) {
    return Response.json(
      { error: "More advancers configured than players in the field." },
      { status: 409 },
    );
  }

  // Re-read standings from the database inside the request to seed advancers.
  const standings = computeStandings(
    detail.players.map((p) => ({ id: p.id, name: p.name })),
    detail.rounds
      .filter((r) => r.phase === "ROUND_ROBIN")
      .flatMap((r) =>
        r.games
          .filter(
            (g) =>
              g.status === "FINAL" && g.scoreA !== null && g.scoreB !== null,
          )
          .map((g) => ({
            teamA: g.teamA.map((p) => p.id),
            teamB: g.teamB.map((p) => p.id),
            scoreA: g.scoreA!,
            scoreB: g.scoreB!,
          })),
      ),
  );
  const advancers = selectAdvancers(standings, detail.numAdvancing);
  const seedToPlayer = new Map(
    advancers.map((row, i) => [i + 1, row.playerId]),
  );

  await prisma.$transaction(async (tx) => {
    // Snapshot Round 1 rank into each advancing player's seed.
    await tx.player.updateMany({
      where: { tournamentId: id },
      data: { seed: null },
    });
    for (const [seed, playerId] of seedToPlayer) {
      await tx.player.update({ where: { id: playerId }, data: { seed } });
    }

    if (detail.moneyRoundFormat === "ROUND_ROBIN") {
      const orderedIds = advancers.map((row) => row.playerId);
      const games =
        detail.moneyRoundMatchType === "SINGLES"
          ? generateSinglesRoundRobin(orderedIds, detail.numCourts)
          : generateRotatingDoubles(
              orderedIds,
              detail.moneyRoundGames,
              detail.numCourts,
            );
      const waves = [...new Set(games.map((g) => g.wave))].sort(
        (a, b) => a - b,
      );
      for (const wave of waves) {
        await tx.round.create({
          data: {
            tournamentId: id,
            number: wave + 1,
            phase: "MONEY_ROUND",
            games: {
              create: games
                .filter((g) => g.wave === wave)
                .map((g) => ({
                  court: g.court,
                  matchType: detail.moneyRoundMatchType,
                  gamePlayers: {
                    create: [
                      ...g.sideA.map((playerId) => ({
                        playerId,
                        team: "A" as const,
                      })),
                      ...g.sideB.map((playerId) => ({
                        playerId,
                        team: "B" as const,
                      })),
                    ],
                  },
                })),
            },
          },
        });
      }
    } else {
      const plan = planBracket(detail.numAdvancing);
      // One Round row per bracket round; create games back to front so
      // nextGameId links can be set at creation time.
      const roundIds = new Map<number, string>();
      for (let r = 1; r <= plan.numRounds; r++) {
        const round = await tx.round.create({
          data: { tournamentId: id, number: r, phase: "MONEY_ROUND" },
        });
        roundIds.set(r, round.id);
      }
      const gameIds = new Map<string, string>(); // "round:slot" -> game id
      const sorted = [...plan.matches].sort(
        (a, b) => b.bracketRound - a.bracketRound,
      );
      for (const match of sorted) {
        const playersHere: Array<{ playerId: string; team: "A" | "B" }> = [];
        if (match.seedA !== undefined) {
          playersHere.push({
            playerId: seedToPlayer.get(match.seedA)!,
            team: "A",
          });
        }
        if (match.seedB !== undefined) {
          playersHere.push({
            playerId: seedToPlayer.get(match.seedB)!,
            team: "B",
          });
        }
        const nextKey = `${match.bracketRound + 1}:${Math.floor(match.bracketSlot / 2)}`;
        const game = await tx.game.create({
          data: {
            roundId: roundIds.get(match.bracketRound)!,
            court: (match.bracketSlot % detail.numCourts) + 1,
            matchType: detail.moneyRoundMatchType,
            bracketRound: match.bracketRound,
            bracketSlot: match.bracketSlot,
            nextGameId:
              match.bracketRound < plan.numRounds
                ? (gameIds.get(nextKey) ?? null)
                : null,
            gamePlayers: { create: playersHere },
          },
        });
        gameIds.set(`${match.bracketRound}:${match.bracketSlot}`, game.id);
      }
    }

    await tx.tournament.update({
      where: { id },
      data: { status: "MONEY_ROUND" },
    });
  });

  return Response.json({
    ok: true,
    advancers: advancers.map((row, i) => ({
      playerId: row.playerId,
      name: row.name,
      seed: i + 1,
    })),
  });
}
