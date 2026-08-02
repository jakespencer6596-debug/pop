"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useTournament } from "@/lib/useTournament";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { TournamentForm, defaultsFrom } from "@/components/TournamentForm";
import { CopyLinkRow } from "@/components/CopyLinkRow";

export function SetupTab({ tournamentId }: { tournamentId: string }) {
  const { data, mutate, isLoading } = useTournament(tournamentId);
  const toast = useToast();
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (isLoading || !data) {
    return <p className="py-8 text-center text-sm text-muted">Loading</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader
          title="Share links"
          description="The live leaderboard and the pay page are public. No login needed."
        />
        <CardBody className="flex flex-col gap-3">
          <CopyLinkRow label="Live leaderboard" path={`/live/${data.id}`} />
          <CopyLinkRow label="Pay page" path={`/pay/${data.id}`} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Settings"
          description="Format, scoring rules, and payment details."
        />
        <CardBody>
          <TournamentForm
            key={data.id}
            initial={defaultsFrom(data)}
            submitLabel="Save settings"
            onSubmit={async (payload) => {
              await apiFetch(`/api/tournaments/${data.id}`, {
                method: "PATCH",
                body: payload,
              });
              await mutate();
              toast("Settings saved", "success");
              router.refresh();
            }}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Danger zone"
          description="Deleting a tournament removes its players, schedule, and scores."
        />
        <CardBody>
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>
            Delete tournament
          </Button>
        </CardBody>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this tournament?"
        body={`This permanently removes ${data.name}, including every player, game, and score.`}
        confirmLabel="Delete"
        destructive
        busy={deleting}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          setDeleting(true);
          try {
            await apiFetch(`/api/tournaments/${data.id}`, { method: "DELETE" });
            router.push("/");
            router.refresh();
          } catch (err) {
            setDeleting(false);
            toast(
              err instanceof Error ? err.message : "Delete failed",
              "error",
            );
          }
        }}
      />
    </div>
  );
}
