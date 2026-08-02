import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { NewTournamentForm } from "./NewTournamentForm";

export const metadata: Metadata = { title: "Create tournament" };

export default async function NewTournamentPage() {
  await requireAdminPage();
  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card>
        <CardHeader
          title="Create tournament"
          description="Defaults match the standard 16-player format. Everything can be changed later."
        />
        <CardBody>
          <NewTournamentForm />
        </CardBody>
      </Card>
    </div>
  );
}
