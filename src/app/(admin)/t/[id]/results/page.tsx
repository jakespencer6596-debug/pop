import type { Metadata } from "next";
import { ResultsTab } from "./ResultsTab";

export const metadata: Metadata = { title: "Results" };

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ResultsTab tournamentId={id} />;
}
