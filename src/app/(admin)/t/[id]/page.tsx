import type { Metadata } from "next";
import { SetupTab } from "./SetupTab";

export const metadata: Metadata = { title: "Setup" };

export default async function SetupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SetupTab tournamentId={id} />;
}
