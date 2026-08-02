import type { Metadata } from "next";
import { ScoringTab } from "./ScoringTab";

export const metadata: Metadata = { title: "Scoring" };

export default async function ScoringPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ScoringTab tournamentId={id} />;
}
