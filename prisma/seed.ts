import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { createRng } from "../src/lib/engine/rng";
import { generateRoundRobinSchedule } from "../src/lib/engine/schedule";
import { generateSinglesRoundRobin } from "../src/lib/engine/moneyRound";
import {
  computeStandings,
  selectAdvancers,
  type FinalGame,
} from "../src/lib/engine/standings";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const PLAYER_NAMES = [
  "Jimmy Brown",
  "Maria Delgado",
  "Chris Okafor",
  "Sarah Whitfield",
  "Tony Ricci",
  "Dana Kowalski",
  "Marcus Lee",
  "Priya Natarajan",
  "Kevin O'Rourke",
  "Alicia Fontaine",
  "Derek Sandoval",
  "Emily Tran",
  "Walt Jenkins",
  "Nadia Petrov",
  "Sam Castellano",
  "Grace Liu",
];

/** Deterministic plausible final score: winner hits 11, loser lands 2 to 9. */
function simulateScore(rng: () => number): [number, number] {
  const loser = 2 + Math.floor(rng() * 8);
  const aWins = rng() < 0.5;
  return aWins ? [11, loser] : [loser, 11];
}

async function main() {
  // Reset: the seed is safe to re-run.
  await prisma.tournament.deleteMany();

  const rng = createRng(20260801);

  const tournament = await prisma.tournament.create({
    data: {
      name: "POP Test Event",
      venue: "Riverside Racquet Club",
      date: new Date("2026-08-01T00:00:00.000Z"),
      status: "SETUP",
      entryFeeCents: 2000,
      prizePoolCents: 20000,
      venmoHandle: "jimmy-brown-pop",
      venmoNote: "SUPER Pop-Up entry",
    },
  });

  // Players: a realistic mix of payment states, everyone checked in.
  const players = [] as Array<{ id: string; name: string }>;
  for (const [i, name] of PLAYER_NAMES.entries()) {
    const paymentMethod = i < 9 ? "VENMO" : i < 13 ? "CASH" : null;
    const player = await prisma.player.create({
      data: {
        tournamentId: tournament.id,
        name,
        contact: i % 3 === 0 ? `555-01${String(10 + i)}` : null,
        checkedIn: true,
        paymentStatus: paymentMethod ? "PAID" : "UNPAID",
        paymentMethod,
      },
    });
    players.push({ id: player.id, name: player.name });
  }

  // Round 1: real generator output, every game played to a final score.
  const schedule = generateRoundRobinSchedule({
    playerIds: players.map((p) => p.id),
    numCourts: 4,
    numRounds: 6,
    seed: 11,
  });

  const rrFinals: FinalGame[] = [];
  for (const [i, round] of schedule.rounds.entries()) {
    await prisma.round.create({
      data: {
        tournamentId: tournament.id,
        number: i + 1,
        phase: "ROUND_ROBIN",
        status: "COMPLETED",
        games: {
          create: round.games.map((game) => {
            const [scoreA, scoreB] = simulateScore(rng);
            rrFinals.push({
              teamA: game.teamA,
              teamB: game.teamB,
              scoreA,
              scoreB,
            });
            return {
              court: game.court,
              matchType: "DOUBLES" as const,
              scoreA,
              scoreB,
              status: "FINAL" as const,
              gamePlayers: {
                create: [
                  ...game.teamA.map((playerId) => ({
                    playerId,
                    team: "A" as const,
                  })),
                  ...game.teamB.map((playerId) => ({
                    playerId,
                    team: "B" as const,
                  })),
                ],
              },
            };
          }),
        },
      },
    });
  }

  // Advancement: seed the top 6 exactly the way the app does.
  const standings = computeStandings(players, rrFinals);
  const advancers = selectAdvancers(standings, 6);
  for (const [i, row] of advancers.entries()) {
    await prisma.player.update({
      where: { id: row.playerId },
      data: { seed: i + 1 },
    });
  }

  // Super Money Round: singles round robin among the six, fully played.
  const moneyGames = generateSinglesRoundRobin(
    advancers.map((row) => row.playerId),
    4,
  );
  const waves = [...new Set(moneyGames.map((g) => g.wave))].sort(
    (a, b) => a - b,
  );
  for (const wave of waves) {
    await prisma.round.create({
      data: {
        tournamentId: tournament.id,
        number: wave + 1,
        phase: "MONEY_ROUND",
        status: "COMPLETED",
        games: {
          create: moneyGames
            .filter((g) => g.wave === wave)
            .map((g) => {
              const [scoreA, scoreB] = simulateScore(rng);
              return {
                court: g.court,
                matchType: "SINGLES" as const,
                scoreA,
                scoreB,
                status: "FINAL" as const,
                gamePlayers: {
                  create: [
                    { playerId: g.sideA[0], team: "A" as const },
                    { playerId: g.sideB[0], team: "B" as const },
                  ],
                },
              };
            }),
        },
      },
    });
  }

  await prisma.tournament.update({
    where: { id: tournament.id },
    data: { status: "COMPLETED" },
  });

  // A second event still in setup, so the dashboard shows both states.
  const upcoming = await prisma.tournament.create({
    data: {
      name: "Jimmy Brown's SUPER Pop-Up Tournament",
      venue: "Riverside Racquet Club",
      date: new Date("2026-08-15T00:00:00.000Z"),
      status: "SETUP",
      entryFeeCents: 2000,
      prizePoolCents: 20000,
      venmoHandle: "jimmy-brown-pop",
      venmoNote: "SUPER Pop-Up entry",
    },
  });
  for (const name of PLAYER_NAMES.slice(0, 10)) {
    await prisma.player.create({
      data: { tournamentId: upcoming.id, name },
    });
  }

  console.log(`Seeded "POP Test Event" (${tournament.id}) as a completed run`);
  console.log(`Seeded "${upcoming.name}" (${upcoming.id}) in setup`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
