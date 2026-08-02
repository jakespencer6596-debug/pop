"use client";

import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { TournamentForm, defaultsFrom } from "@/components/TournamentForm";

export function NewTournamentForm() {
  const router = useRouter();
  return (
    <TournamentForm
      initial={defaultsFrom()}
      submitLabel="Create tournament"
      onSubmit={async (payload) => {
        const { id } = await apiFetch<{ id: string }>("/api/tournaments", {
          method: "POST",
          body: payload,
        });
        router.push(`/t/${id}`);
      }}
    />
  );
}
