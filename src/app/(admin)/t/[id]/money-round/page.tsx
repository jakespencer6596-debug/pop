import type { Metadata } from "next";
import { MoneyRoundTab } from "./MoneyRoundTab";

export const metadata: Metadata = { title: "Money round" };

export default async function MoneyRoundPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MoneyRoundTab tournamentId={id} />;
}
