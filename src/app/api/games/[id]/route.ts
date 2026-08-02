import { requireAdminApi } from "@/lib/auth";
import { bracketNextPosition } from "@/lib/engine/moneyRound";
import { validateFinalScore } from "@/lib/engine/score";
import { prisma } from "@/lib/prisma";
import { gamePatchSchema, parseError } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;
  const parsed = gamePatchSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return Response.json({ error: parseError(parsed) }, { status: 400 });
  }

  const game = await prisma.game.findUnique({
    where: { id },
    include: {
      gamePlayers: true,
      round: { include: { tournament: true } },
    },
  });
  if (!game) {
    return Response.json({ error: "Game not found" }, { status: 404 });
  }
  const tournament = game.round.tournament;

  const scoreA =
    parsed.data.scoreA !== undefined ? parsed.data.scoreA : game.scoreA;
  const scoreB =
    parsed.data.scoreB !== undefined ? parsed.data.scoreB : game.scoreB;
  const nextStatus = parsed.data.status ?? game.status;

  if (nextStatus === "FINAL") {
    if (scoreA === null || scoreB === null) {
      return Response.json(
        { error: "Enter both scores before marking the game final." },
        { status: 400 },
      );
    }
    if (scoreA === scoreB) {
      return Response.json(
        { error: "A game cannot end in a tie." },
        { status: 400 },
      );
    }
    const check = validateFinalScore(
      scoreA,
      scoreB,
      tournament.gameTarget,
      tournament.winByTwo,
    );
    if (!check.ok && !parsed.data.override) {
      return Response.json(
        { error: check.message, needsOverride: true },
        { status: 422 },
      );
    }
  }

  const isBracketGame =
    game.round.phase === "MONEY_ROUND" &&
    tournament.moneyRoundFormat === "BRACKET";

  // Guard bracket edits: once the next game is final, this result is locked.
  if (isBracketGame && game.nextGameId) {
    const nextGame = await prisma.game.findUnique({
      where: { id: game.nextGameId },
    });
    if (nextGame?.status === "FINAL" && game.status === "FINAL") {
      return Response.json(
        {
          error:
            "A later bracket game built on this result is already final. Reopen that game first.",
        },
        { status: 409 },
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.game.update({
      where: { id },
      data: { scoreA, scoreB, status: nextStatus },
    });

    // Keep the round status in sync with its games.
    const roundGames = await tx.game.findMany({
      where: { roundId: game.roundId },
      select: { id: true, status: true, scoreA: true, scoreB: true },
    });
    const updated = roundGames.map((g) =>
      g.id === id ? { ...g, status: nextStatus, scoreA, scoreB } : g,
    );
    const allFinal = updated.every((g) => g.status === "FINAL");
    const anyActivity = updated.some(
      (g) => g.status !== "SCHEDULED" || g.scoreA !== null || g.scoreB !== null,
    );
    await tx.round.update({
      where: { id: game.roundId },
      data: {
        status: allFinal
          ? "COMPLETED"
          : anyActivity
            ? "IN_PROGRESS"
            : "SCHEDULED",
      },
    });

    if (isBracketGame) {
      await applyBracketProgression(tx, {
        gameId: id,
        nextGameId: game.nextGameId,
        bracketSlot: game.bracketSlot ?? 0,
        finalized: nextStatus === "FINAL",
        scoreA,
        scoreB,
        gamePlayers: game.gamePlayers,
        tournamentId: tournament.id,
      });
    } else if (game.round.phase === "MONEY_ROUND") {
      // Round robin money format: the tournament completes when every
      // money round game is final.
      const moneyGames = await tx.game.findMany({
        where: {
          round: { tournamentId: tournament.id, phase: "MONEY_ROUND" },
        },
        select: { status: true },
      });
      const done =
        moneyGames.length > 0 && moneyGames.every((g) => g.status === "FINAL");
      await tx.tournament.update({
        where: { id: tournament.id },
        data: { status: done ? "COMPLETED" : "MONEY_ROUND" },
      });
    }
  });

  return Response.json({ ok: true });
}

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

async function applyBracketProgression(
  tx: Tx,
  input: {
    gameId: string;
    nextGameId: string | null;
    bracketSlot: number;
    finalized: boolean;
    scoreA: number | null;
    scoreB: number | null;
    gamePlayers: Array<{ playerId: string; team: "A" | "B" }>;
    tournamentId: string;
  },
) {
  if (input.nextGameId) {
    // Remove any previously advanced player from this game before
    // re-applying, so score corrections stay consistent.
    const participantIds = input.gamePlayers.map((gp) => gp.playerId);
    await tx.gamePlayer.deleteMany({
      where: { gameId: input.nextGameId, playerId: { in: participantIds } },
    });
    if (input.finalized && input.scoreA !== null && input.scoreB !== null) {
      const winningTeam = input.scoreA > input.scoreB ? "A" : "B";
      const winners = input.gamePlayers.filter((gp) => gp.team === winningTeam);
      const { side } = bracketNextPosition(input.bracketSlot);
      await tx.gamePlayer.createMany({
        data: winners.map((gp) => ({
          gameId: input.nextGameId!,
          playerId: gp.playerId,
          team: side,
        })),
      });
    }
    await tx.tournament.update({
      where: { id: input.tournamentId },
      data: { status: "MONEY_ROUND" },
    });
  } else {
    // No next game: this is the final. Finalizing it crowns the champion.
    await tx.tournament.update({
      where: { id: input.tournamentId },
      data: { status: input.finalized ? "COMPLETED" : "MONEY_ROUND" },
    });
  }
}
