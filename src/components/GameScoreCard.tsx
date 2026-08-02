"use client";

import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { GameDTO } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ScoreStepper } from "@/components/ui/ScoreStepper";
import { useToast } from "@/components/ui/Toast";

/** Score entry for a single game: steppers, finalize, and reopen. */
export function GameScoreCard({
  game,
  onChanged,
  courtLabel,
}: {
  game: GameDTO;
  onChanged: () => Promise<unknown>;
  courtLabel?: string;
}) {
  const toast = useToast();
  const [scoreA, setScoreA] = useState<number | null>(game.scoreA);
  const [scoreB, setScoreB] = useState<number | null>(game.scoreB);
  const [busy, setBusy] = useState(false);
  const [overridePrompt, setOverridePrompt] = useState<string | null>(null);
  const isFinal = game.status === "FINAL";

  const aWon =
    isFinal && game.scoreA !== null && game.scoreB !== null
      ? game.scoreA > game.scoreB
      : null;

  async function save(status: "FINAL" | "IN_PROGRESS", override = false) {
    setBusy(true);
    try {
      await apiFetch(`/api/games/${game.id}`, {
        method: "PATCH",
        body: { scoreA, scoreB, status, override },
      });
      await onChanged();
      setOverridePrompt(null);
      if (status === "FINAL") toast("Game marked final", "success");
    } catch (err) {
      if (err instanceof ApiError && err.needsOverride) {
        setOverridePrompt(err.message);
      } else {
        toast(err instanceof Error ? err.message : "Could not save", "error");
      }
    } finally {
      setBusy(false);
    }
  }

  async function reopen() {
    setBusy(true);
    try {
      await apiFetch(`/api/games/${game.id}`, {
        method: "PATCH",
        body: { status: "IN_PROGRESS" },
      });
      await onChanged();
      toast("Game reopened");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not reopen", "error");
    } finally {
      setBusy(false);
    }
  }

  const waiting = game.teamA.length === 0 || game.teamB.length === 0;

  return (
    <div className="rounded-[12px] border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted">
          {courtLabel ?? (game.court !== null ? `Court ${game.court}` : "")}
        </span>
        {isFinal ? (
          <Badge tone="positive">Final</Badge>
        ) : game.status === "IN_PROGRESS" ? (
          <Badge tone="info">In progress</Badge>
        ) : null}
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <TeamLabel
          names={game.teamA.map((p) => p.name)}
          highlight={aWon === true}
          dim={aWon === false}
          placeholder="Waiting for winner"
        />
        <span className="text-center text-xs font-medium text-muted">vs</span>
        <TeamLabel
          names={game.teamB.map((p) => p.name)}
          highlight={aWon === false}
          dim={aWon === true}
          placeholder="Waiting for winner"
          alignRight
        />
      </div>

      {!waiting && (
        <>
          <div className="mt-4 flex items-center justify-center gap-6">
            <ScoreStepper
              label="Team A"
              value={isFinal ? game.scoreA : scoreA}
              onChange={setScoreA}
              disabled={isFinal || busy}
            />
            <ScoreStepper
              label="Team B"
              value={isFinal ? game.scoreB : scoreB}
              onChange={setScoreB}
              disabled={isFinal || busy}
            />
          </div>
          <div className="mt-4 flex justify-center gap-2">
            {isFinal ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={reopen}
                disabled={busy}
              >
                Reopen
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => save("FINAL")}
                disabled={busy || scoreA === null || scoreB === null}
              >
                Mark final
              </Button>
            )}
          </div>
        </>
      )}
      {waiting && (
        <p className="mt-3 text-center text-[13px] text-muted">
          This matchup fills in when the earlier games are final.
        </p>
      )}

      <ConfirmDialog
        open={overridePrompt !== null}
        title="Unusual score"
        body={
          <>
            <p>{overridePrompt}</p>
            <p className="mt-2">
              Record {scoreA} to {scoreB} anyway?
            </p>
          </>
        }
        confirmLabel="Record anyway"
        busy={busy}
        onCancel={() => setOverridePrompt(null)}
        onConfirm={() => save("FINAL", true)}
      />
    </div>
  );
}

function TeamLabel({
  names,
  highlight,
  dim,
  placeholder,
  alignRight,
}: {
  names: string[];
  highlight: boolean;
  dim: boolean;
  placeholder: string;
  alignRight?: boolean;
}) {
  return (
    <div className={cn("min-w-0", alignRight && "text-right")}>
      {names.length === 0 ? (
        <span className="text-[13px] text-muted">{placeholder}</span>
      ) : (
        names.map((name) => (
          <p
            key={name}
            className={cn(
              "truncate text-sm font-medium",
              highlight ? "text-positive" : dim ? "text-muted" : "text-ink",
            )}
          >
            {name}
          </p>
        ))
      )}
    </div>
  );
}
