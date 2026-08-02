import type { Metadata } from "next";
import { ScheduleTab } from "./ScheduleTab";

export const metadata: Metadata = { title: "Schedule" };

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ScheduleTab tournamentId={id} />;
}
