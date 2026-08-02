import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseError, tournamentCreateSchema } from "@/lib/validation";
import type { TournamentSummaryDTO } from "@/lib/types";

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const tournaments = await prisma.tournament.findMany({
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: { _count: { select: { players: true } } },
  });
  const payload: TournamentSummaryDTO[] = tournaments.map((t) => ({
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
    playerCount: t._count.players,
  }));
  return Response.json(payload);
}

export async function POST(request: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const parsed = tournamentCreateSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return Response.json({ error: parseError(parsed) }, { status: 400 });
  }
  const tournament = await prisma.tournament.create({ data: parsed.data });
  return Response.json({ id: tournament.id }, { status: 201 });
}
