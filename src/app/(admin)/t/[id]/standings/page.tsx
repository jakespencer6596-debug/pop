import type { Metadata } from "next";
import { StandingsTab } from "./StandingsTab";

export const metadata: Metadata = { title: "Standings" };

export default async function StandingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StandingsTab tournamentId={id} />;
}
