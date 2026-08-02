import { requireAdminApi } from "@/lib/auth";
import { generateRoundRobinSchedule } from "@/lib/engine/schedule";
import { prisma } from "@/lib/prisma";
import { parseError, scheduleGenerateSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Context) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;
  const parsed = scheduleGenerateSchema.safeParse(
    await request.json().catch(() => ({})),
  );
  if (!parsed.success) {
    return Response.json({ error: parseError(parsed) }, { status: 400 });
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      players: true,
      rounds: { select: { id: true, phase: true } },
    },
  });
  if (!tournament) {
    return Response.json({ error: "Tournament not found" }, { status: 404 });
  }
  if (tournament.rounds.some((r) => r.phase === "MONEY_ROUND")) {
    return Response.json(
      { error: "The money round has started. The schedule is locked." },
      { status: 409 },
    );
  }

  const n = tournament.players.length;
  if (n < 4 || n % 4 !== 0) {
    return Response.json(
      {
        error: `Round 1 needs a multiple of 4 players. You have ${n}.`,
      },
      { status: 409 },
    );
  }
  if (n / 4 > tournament.numCourts) {
    return Response.json(
      {
        error: `${n} players need ${n / 4} courts but this tournament has ${tournament.numCourts}.`,
      },
      { status: 409 },
    );
  }

  let schedule;
  try {
    schedule = generateRoundRobinSchedule({
      playerIds: tournament.players.map((p) => p.id),
      numCourts: tournament.numCourts,
      numRounds: tournament.roundRobinGames,
      seed: parsed.data.seed ?? 1,
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Could not generate" },
      { status: 409 },
    );
  }

  await prisma.$transaction(async (tx) => {
    // Replace any existing round robin schedule.
    await tx.round.deleteMany({
      where: { tournamentId: id, phase: "ROUND_ROBIN" },
    });
    for (const [i, round] of schedule.rounds.entries()) {
      await tx.round.create({
        data: {
          tournamentId: id,
          number: i + 1,
          phase: "ROUND_ROBIN",
          games: {
            create: round.games.map((game) => ({
              court: game.court,
              matchType: "DOUBLES",
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
            })),
          },
        },
      });
    }
    await tx.tournament.update({
      where: { id },
      data: { status: "ROUND_ROBIN" },
    });
  });

  return Response.json({ ok: true, stats: schedule.stats });
}
