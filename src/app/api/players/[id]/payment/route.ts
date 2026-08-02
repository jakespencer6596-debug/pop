import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseError, paymentPatchSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;
  const parsed = paymentPatchSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return Response.json({ error: parseError(parsed) }, { status: 400 });
  }
  const existing = await prisma.player.findUnique({ where: { id } });
  if (!existing) {
    return Response.json({ error: "Player not found" }, { status: 404 });
  }
  const { paymentStatus, paymentMethod } = parsed.data;
  await prisma.player.update({
    where: { id },
    data: {
      paymentStatus,
      paymentMethod: paymentStatus === "PAID" ? paymentMethod : null,
    },
  });
  return Response.json({ ok: true });
}
