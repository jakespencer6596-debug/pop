import type { Metadata } from "next";
import { PaymentsTab } from "./PaymentsTab";

export const metadata: Metadata = { title: "Payments" };

export default async function PaymentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PaymentsTab tournamentId={id} />;
}
