import { requireAdminApi } from "@/lib/auth";
import { getTournamentDetail } from "@/lib/tournament";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Context) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;
  const phase = new URL(request.url).searchParams.get("phase") ?? "ROUND_ROBIN";
  if (phase !== "ROUND_ROBIN" && phase !== "MONEY_ROUND") {
    return Response.json(
      { error: "phase must be ROUND_ROBIN or MONEY_ROUND" },
      { status: 400 },
    );
  }
  const detail = await getTournamentDetail(id);
  if (!detail) {
    return Response.json({ error: "Tournament not found" }, { status: 404 });
  }
  return Response.json(
    phase === "ROUND_ROBIN"
      ? detail.roundRobinStandings
      : (detail.moneyRoundStandings ?? []),
  );
}
