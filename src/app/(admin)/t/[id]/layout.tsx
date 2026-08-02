import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TournamentStatusBadge } from "@/components/ui/Badge";
import { TournamentTabs } from "@/components/TournamentTabs";

export default async function TournamentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  const tournament = await prisma.tournament.findUnique({
    where: { id },
    select: { id: true, name: true, status: true },
  });
  if (!tournament) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div className="no-print flex flex-wrap items-center gap-2.5">
        <h1 className="font-display text-xl font-bold text-ink">
          {tournament.name}
        </h1>
        <TournamentStatusBadge status={tournament.status} />
      </div>
      <TournamentTabs tournamentId={tournament.id} />
      <div>{children}</div>
    </div>
  );
}
