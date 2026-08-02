import { getTournamentPublic } from "@/lib/tournament";

type Context = { params: Promise<{ id: string }> };

// Public read-only payload for the live leaderboard and pay pages.
export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  const detail = await getTournamentPublic(id);
  if (!detail) {
    return Response.json({ error: "Tournament not found" }, { status: 404 });
  }
  return Response.json(detail);
}
