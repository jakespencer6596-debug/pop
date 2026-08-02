import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseError, playerPatchSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;
  const parsed = playerPatchSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return Response.json({ error: parseError(parsed) }, { status: 400 });
  }
  const existing = await prisma.player.findUnique({ where: { id } });
  if (!existing) {
    return Response.json({ error: "Player not found" }, { status: 404 });
  }
  await prisma.player.update({ where: { id }, data: parsed.data });
  return Response.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Context) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;
  const existing = await prisma.player.findUnique({
    where: { id },
    include: { _count: { select: { gamePlayers: true } } },
  });
  if (!existing) {
    return Response.json({ error: "Player not found" }, { status: 404 });
  }
  if (existing._count.gamePlayers > 0) {
    return Response.json(
      {
        error:
          "This player is already on the schedule. Regenerate the schedule after removing them.",
      },
      { status: 409 },
    );
  }
  await prisma.player.delete({ where: { id } });
  return Response.json({ ok: true });
}
