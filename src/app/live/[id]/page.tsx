import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LiveView } from "./LiveView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const t = await prisma.tournament.findUnique({
    where: { id },
    select: { name: true },
  });
  return { title: t ? `${t.name} live` : "Live" };
}

export default async function LivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exists = await prisma.tournament.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!exists) notFound();
  return <LiveView tournamentId={id} />;
}
