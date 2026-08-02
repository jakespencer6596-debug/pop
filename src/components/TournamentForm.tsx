"use client";

import { useState } from "react";
import type { TournamentSettingsDTO } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";

export interface TournamentFormValues {
  name: string;
  venue: string;
  date: string;
  numCourts: number;
  gameTarget: number;
  winByTwo: boolean;
  roundRobinGames: number;
  numAdvancing: number;
  moneyRoundFormat: "ROUND_ROBIN" | "BRACKET";
  moneyRoundMatchType: "SINGLES" | "DOUBLES";
  moneyRoundGames: number;
  entryFee: string;
  prizePool: string;
  venmoHandle: string;
  venmoNote: string;
}

export function defaultsFrom(t?: TournamentSettingsDTO): TournamentFormValues {
  return {
    name: t?.name ?? "",
    venue: t?.venue ?? "",
    date: t?.date ? t.date.slice(0, 10) : "",
    numCourts: t?.numCourts ?? 4,
    gameTarget: t?.gameTarget ?? 11,
    winByTwo: t?.winByTwo ?? true,
    roundRobinGames: t?.roundRobinGames ?? 6,
    numAdvancing: t?.numAdvancing ?? 6,
    moneyRoundFormat: t?.moneyRoundFormat ?? "ROUND_ROBIN",
    moneyRoundMatchType: t?.moneyRoundMatchType ?? "SINGLES",
    moneyRoundGames: t?.moneyRoundGames ?? 5,
    entryFee: t ? (t.entryFeeCents / 100).toString() : "0",
    prizePool: t ? (t.prizePoolCents / 100).toString() : "0",
    venmoHandle: t?.venmoHandle ?? "",
    venmoNote: t?.venmoNote ?? "",
  };
}

function toPayload(values: TournamentFormValues) {
  return {
    name: values.name,
    venue: values.venue || null,
    date: values.date || null,
    numCourts: values.numCourts,
    gameTarget: values.gameTarget,
    winByTwo: values.winByTwo,
    roundRobinGames: values.roundRobinGames,
    numAdvancing: values.numAdvancing,
    moneyRoundFormat: values.moneyRoundFormat,
    moneyRoundMatchType: values.moneyRoundMatchType,
    moneyRoundGames: values.moneyRoundGames,
    entryFeeCents: Math.round(parseFloat(values.entryFee || "0") * 100),
    prizePoolCents: Math.round(parseFloat(values.prizePool || "0") * 100),
    venmoHandle: values.venmoHandle || null,
    venmoNote: values.venmoNote || null,
  };
}

export function TournamentForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial: TournamentFormValues;
  submitLabel: string;
  onSubmit: (payload: ReturnType<typeof toPayload>) => Promise<void>;
}) {
  const [values, setValues] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof TournamentFormValues>(
    key: K,
    value: TournamentFormValues[K],
  ) => setValues((v) => ({ ...v, [key]: value }));

  const numberField = (
    label: string,
    key:
      | "numCourts"
      | "gameTarget"
      | "roundRobinGames"
      | "numAdvancing"
      | "moneyRoundGames",
    hint?: string,
  ) => (
    <Input
      label={label}
      type="number"
      inputMode="numeric"
      min={1}
      value={String(values[key])}
      hint={hint}
      onChange={(e) => set(key, parseInt(e.target.value || "0", 10))}
    />
  );

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
          await onSubmit(toPayload(values));
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not save.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <section className="flex flex-col gap-4">
        <h3 className="font-display text-sm font-semibold text-ink">Event</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Name"
            required
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Jimmy Brown's SUPER Pop-Up Tournament"
          />
          <Input
            label="Venue"
            value={values.venue}
            onChange={(e) => set("venue", e.target.value)}
            placeholder="Optional"
          />
          <Input
            label="Date"
            type="date"
            value={values.date}
            onChange={(e) => set("date", e.target.value)}
          />
          {numberField("Courts", "numCourts")}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-display text-sm font-semibold text-ink">
          Round 1: round robin
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {numberField("Game target", "gameTarget", "Points to win a game")}
          {numberField("Games per player", "roundRobinGames")}
          {numberField("Players advancing", "numAdvancing")}
        </div>
        <Toggle
          label="Win by two"
          checked={values.winByTwo}
          onChange={(v) => set("winByTwo", v)}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-display text-sm font-semibold text-ink">
          Super Money Round
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Select
            label="Format"
            value={values.moneyRoundFormat}
            onChange={(e) =>
              set(
                "moneyRoundFormat",
                e.target.value as TournamentFormValues["moneyRoundFormat"],
              )
            }
          >
            <option value="ROUND_ROBIN">Round robin</option>
            <option value="BRACKET">Single elimination bracket</option>
          </Select>
          <Select
            label="Match type"
            value={values.moneyRoundMatchType}
            onChange={(e) =>
              set(
                "moneyRoundMatchType",
                e.target.value as TournamentFormValues["moneyRoundMatchType"],
              )
            }
          >
            <option value="SINGLES">Singles</option>
            <option value="DOUBLES">Doubles</option>
          </Select>
          {values.moneyRoundFormat === "ROUND_ROBIN" &&
            values.moneyRoundMatchType === "DOUBLES" &&
            numberField(
              "Games per player",
              "moneyRoundGames",
              "Used for rotating doubles",
            )}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-display text-sm font-semibold text-ink">Money</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Entry fee (dollars)"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={values.entryFee}
            onChange={(e) => set("entryFee", e.target.value)}
          />
          <Input
            label="Prize pool (dollars)"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={values.prizePool}
            onChange={(e) => set("prizePool", e.target.value)}
          />
          <Input
            label="Venmo handle"
            value={values.venmoHandle}
            onChange={(e) => set("venmoHandle", e.target.value)}
            placeholder="your-venmo-name"
            hint="Shown on the public pay page"
          />
          <Input
            label="Venmo note"
            value={values.venmoNote}
            onChange={(e) => set("venmoNote", e.target.value)}
            placeholder="Pop-up entry"
            hint="Pre-filled in the payment link"
          />
        </div>
      </section>

      {error && <p className="text-sm text-danger">{error}</p>}
      <div>
        <Button
          type="submit"
          disabled={busy || values.name.trim().length === 0}
        >
          {busy ? "Saving" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

export type TournamentPayload = ReturnType<typeof toPayload>;
