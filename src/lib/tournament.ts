import { prisma } from "@/lib/prisma";
import { computeStandings, type FinalGame } from "@/lib/engine/standings";
import type {
  GameDTO,
  PlacementDTO,
  RoundDTO,
  TournamentDetailDTO,
  TournamentPublicDTO,
} from "@/lib/types";

type TournamentWithRelations = NonNullable<
  Awaited<ReturnType<typeof fetchTournament>>
>;

function fetchTournament(id: string) {
  return prisma.tournament.findUnique({
    where: { id },
    include: {
      players: { orderBy: { createdAt: "asc" } },
      rounds: {
        orderBy: { number: "asc" },
        include: {
          games: {
            orderBy: [{ court: "asc" }, { bracketSlot: "asc" }],
            include: {
              gamePlayers: { include: { player: true } },
            },
          },
        },
      },
    },
  });
}

function toGameDTO(
  game: TournamentWithRelations["rounds"][number]["games"][number],
): GameDTO {
  const teamA = game.gamePlayers
    .filter((gp) => gp.team === "A")
    .map((gp) => ({ id: gp.player.id, name: gp.player.name }));
  const teamB = game.gamePlayers
    .filter((gp) => gp.team === "B")
    .map((gp) => ({ id: gp.player.id, name: gp.player.name }));
  return {
    id: game.id,
    court: game.court,
    matchType: game.matchType,
    scoreA: game.scoreA,
    scoreB: game.scoreB,
    status: game.status,
    bracketRound: game.bracketRound,
    bracketSlot: game.bracketSlot,
    nextGameId: game.nextGameId,
    teamA,
    teamB,
  };
}

function finalGamesOf(
  rounds: RoundDTO[],
  phase: "ROUND_ROBIN" | "MONEY_ROUND",
) {
  const games: FinalGame[] = [];
  for (const round of rounds) {
    if (round.phase !== phase) continue;
    for (const game of round.games) {
      if (game.status !== "FINAL") continue;
      if (game.scoreA === null || game.scoreB === null) continue;
      games.push({
        teamA: game.teamA.map((p) => p.id),
        teamB: game.teamB.map((p) => p.id),
        scoreA: game.scoreA,
        scoreB: game.scoreB,
      });
    }
  }
  return games;
}

export async function getTournamentDetail(
  id: string,
): Promise<TournamentDetailDTO | null> {
  const t = await fetchTournament(id);
  if (!t) return null;

  const rounds: RoundDTO[] = t.rounds.map((round) => ({
    id: round.id,
    number: round.number,
    phase: round.phase,
    status: round.status,
    games: round.games.map(toGameDTO),
  }));

  const playerRefs = t.players.map((p) => ({ id: p.id, name: p.name }));
  const rrRounds = rounds.filter((r) => r.phase === "ROUND_ROBIN");
  const rrGamesTotal = rrRounds.reduce((sum, r) => sum + r.games.length, 0);
  const rrGamesFinal = rrRounds.reduce(
    (sum, r) => sum + r.games.filter((g) => g.status === "FINAL").length,
    0,
  );
  const roundRobinStandings = computeStandings(
    playerRefs,
    finalGamesOf(rounds, "ROUND_ROBIN"),
  );

  const advancers = t.players.filter((p) => p.seed !== null);
  const moneyGames = finalGamesOf(rounds, "MONEY_ROUND");
  const hasMoneyRound = rounds.some((r) => r.phase === "MONEY_ROUND");
  const moneyRoundStandings =
    hasMoneyRound && t.moneyRoundFormat === "ROUND_ROBIN"
      ? computeStandings(
          advancers.map((p) => ({ id: p.id, name: p.name })),
          moneyGames,
        )
      : null;

  const { champion, placements } = computeResults(
    t,
    rounds,
    moneyRoundStandings,
  );

  return {
    id: t.id,
    name: t.name,
    venue: t.venue,
    date: t.date ? t.date.toISOString() : null,
    status: t.status,
    numCourts: t.numCourts,
    gameTarget: t.gameTarget,
    winByTwo: t.winByTwo,
    roundRobinGames: t.roundRobinGames,
    numAdvancing: t.numAdvancing,
    moneyRoundFormat: t.moneyRoundFormat,
    moneyRoundMatchType: t.moneyRoundMatchType,
    moneyRoundGames: t.moneyRoundGames,
    entryFeeCents: t.entryFeeCents,
    prizePoolCents: t.prizePoolCents,
    venmoHandle: t.venmoHandle,
    venmoNote: t.venmoNote,
    players: t.players.map((p) => ({
      id: p.id,
      name: p.name,
      contact: p.contact,
      checkedIn: p.checkedIn,
      paymentStatus: p.paymentStatus,
      paymentMethod: p.paymentMethod,
      seed: p.seed,
    })),
    rounds,
    roundRobinStandings,
    moneyRoundStandings,
    roundRobinComplete: rrGamesTotal > 0 && rrGamesFinal === rrGamesTotal,
    roundRobinGamesTotal: rrGamesTotal,
    roundRobinGamesFinal: rrGamesFinal,
    champion,
    placements,
  };
}

function computeResults(
  t: TournamentWithRelations,
  rounds: RoundDTO[],
  moneyRoundStandings: ReturnType<typeof computeStandings> | null,
): { champion: PlacementDTO | null; placements: PlacementDTO[] } {
  const bySeed = new Map(t.players.map((p) => [p.id, p.seed]));
  const nameOf = new Map(t.players.map((p) => [p.id, p.name]));
  const moneyGames = rounds
    .filter((r) => r.phase === "MONEY_ROUND")
    .flatMap((r) => r.games);
  if (moneyGames.length === 0) return { champion: null, placements: [] };

  if (t.moneyRoundFormat === "ROUND_ROBIN") {
    if (!moneyRoundStandings) return { champion: null, placements: [] };
    const allFinal = moneyGames.every((g) => g.status === "FINAL");
    const placements = moneyRoundStandings.map((row) => ({
      playerId: row.playerId,
      name: row.name,
      seed: bySeed.get(row.playerId) ?? null,
      place: row.rank,
    }));
    return {
      champion: allFinal && placements.length > 0 ? placements[0] : null,
      placements: allFinal ? placements : [],
    };
  }

  // Bracket: champion is the winner of the last bracket round's game.
  const maxRound = Math.max(...moneyGames.map((g) => g.bracketRound ?? 0));
  const finalGame = moneyGames.find((g) => g.bracketRound === maxRound);
  if (
    !finalGame ||
    finalGame.status !== "FINAL" ||
    finalGame.scoreA === null ||
    finalGame.scoreB === null
  ) {
    return { champion: null, placements: [] };
  }
  const aWon = finalGame.scoreA > finalGame.scoreB;
  const winners = aWon ? finalGame.teamA : finalGame.teamB;
  const losers = aWon ? finalGame.teamB : finalGame.teamA;
  if (winners.length === 0) return { champion: null, placements: [] };

  const placements: PlacementDTO[] = [];
  const placed = new Set<string>();
  const push = (playerId: string, place: number) => {
    if (placed.has(playerId)) return;
    placed.add(playerId);
    placements.push({
      playerId,
      name: nameOf.get(playerId) ?? "",
      seed: bySeed.get(playerId) ?? null,
      place,
    });
  };
  push(winners[0].id, 1);
  for (const p of losers) push(p.id, 2);
  // Everyone else eliminated earlier: order by round eliminated (later is
  // better), then by seed.
  const eliminated: Array<{ playerId: string; round: number; seed: number }> =
    [];
  for (const game of moneyGames) {
    if (game.status !== "FINAL" || game.scoreA === null || game.scoreB === null)
      continue;
    const gameLosers = game.scoreA > game.scoreB ? game.teamB : game.teamA;
    for (const p of gameLosers) {
      if (placed.has(p.id)) continue;
      eliminated.push({
        playerId: p.id,
        round: game.bracketRound ?? 0,
        seed: bySeed.get(p.id) ?? 99,
      });
    }
  }
  eliminated.sort((a, b) => b.round - a.round || a.seed - b.seed);
  let place = 3;
  for (const e of eliminated) push(e.playerId, place++);
  return { champion: placements[0] ?? null, placements };
}

export async function getTournamentPublic(
  id: string,
): Promise<TournamentPublicDTO | null> {
  const detail = await getTournamentDetail(id);
  if (!detail) return null;
  return {
    ...detail,
    players: detail.players.map((p) => ({
      id: p.id,
      name: p.name,
      seed: p.seed,
    })),
  };
}
