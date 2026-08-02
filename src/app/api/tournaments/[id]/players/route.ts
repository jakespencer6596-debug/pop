import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseError, playerCreateSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Context) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;
  const parsed = playerCreateSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return Response.json({ error: parseError(parsed) }, { status: 400 });
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: { _count: { select: { players: true } } },
  });
  if (!tournament) {
    return Response.json({ error: "Tournament not found" }, { status: 404 });
  }
  const capacity = tournament.numCourts * 4;
  if (tournament._count.players >= capacity) {
    return Response.json(
      { error: `This tournament is full at ${capacity} players.` },
      { status: 409 },
    );
  }

  const player = await prisma.player.create({
    data: {
      tournamentId: id,
      name: parsed.data.name,
      contact: parsed.data.contact ?? null,
    },
  });
  return Response.json({ id: player.id }, { status: 201 });
}
