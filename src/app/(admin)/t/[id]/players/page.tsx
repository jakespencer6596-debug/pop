import type { Metadata } from "next";
import { PlayersTab } from "./PlayersTab";

export const metadata: Metadata = { title: "Players" };

export default async function PlayersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PlayersTab tournamentId={id} />;
}
