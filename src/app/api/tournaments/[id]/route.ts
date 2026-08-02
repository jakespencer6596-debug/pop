import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTournamentDetail } from "@/lib/tournament";
import { parseError, tournamentPatchSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;
  const detail = await getTournamentDetail(id);
  if (!detail) {
    return Response.json({ error: "Tournament not found" }, { status: 404 });
  }
  return Response.json(detail);
}

export async function PATCH(request: Request, { params }: Context) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;
  const parsed = tournamentPatchSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return Response.json({ error: parseError(parsed) }, { status: 400 });
  }
  const existing = await prisma.tournament.findUnique({ where: { id } });
  if (!existing) {
    return Response.json({ error: "Tournament not found" }, { status: 404 });
  }
  await prisma.tournament.update({ where: { id }, data: parsed.data });
  return Response.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Context) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;
  const existing = await prisma.tournament.findUnique({ where: { id } });
  if (!existing) {
    return Response.json({ error: "Tournament not found" }, { status: 404 });
  }
  await prisma.tournament.delete({ where: { id } });
  return Response.json({ ok: true });
}
