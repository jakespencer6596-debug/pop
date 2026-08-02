"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useTournament } from "@/lib/useTournament";
import type { PlayerDTO } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { useToast } from "@/components/ui/Toast";
import { PaymentSelect } from "@/components/PaymentSelect";

export function PlayersTab({ tournamentId }: { tournamentId: string }) {
  const { data, mutate, isLoading } = useTournament(tournamentId);
  const toast = useToast();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [adding, setAdding] = useState(false);

  if (isLoading || !data) {
    return <p className="py-8 text-center text-sm text-muted">Loading</p>;
  }

  const capacity = data.numCourts * 4;
  const scheduleReady =
    data.players.length >= 4 && data.players.length % 4 === 0;

  async function run(action: () => Promise<unknown>, success?: string) {
    try {
      await action();
      await mutate();
      if (success) toast(success, "success");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Something went wrong",
        "error",
      );
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader
          title={`Players (${data.players.length} of ${capacity})`}
          description={
            scheduleReady
              ? "The field is ready for a schedule."
              : `Round 1 needs a multiple of 4 players before the schedule can be generated.`
          }
        />
        <CardBody>
          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim().length === 0) return;
              setAdding(true);
              run(
                () =>
                  apiFetch(`/api/tournaments/${tournamentId}/players`, {
                    method: "POST",
                    body: {
                      name: name.trim(),
                      contact: contact.trim() || null,
                    },
                  }),
                "Player added",
              ).finally(() => {
                setAdding(false);
                setName("");
                setContact("");
              });
            }}
          >
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="sm:flex-1"
              placeholder="Player name"
            />
            <Input
              label="Contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="sm:flex-1"
              placeholder="Phone or email, optional"
            />
            <Button
              type="submit"
              disabled={
                adding ||
                name.trim().length === 0 ||
                data.players.length >= capacity
              }
            >
              Add player
            </Button>
          </form>
        </CardBody>
      </Card>

      {data.players.length === 0 ? (
        <EmptyState
          title="No players yet"
          description="Add the field above. The standard format is 16 players."
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="pop-table hidden sm:table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Contact</th>
                  <th>Checked in</th>
                  <th>Payment</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {data.players.map((p) => (
                  <PlayerRow key={p.id} player={p} onAction={run} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col divide-y divide-line sm:hidden">
            {data.players.map((p) => (
              <PlayerCard key={p.id} player={p} onAction={run} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

type RunFn = (
  action: () => Promise<unknown>,
  success?: string,
) => Promise<void>;

function PlayerRow({
  player,
  onAction,
}: {
  player: PlayerDTO;
  onAction: RunFn;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(player.name);
  const [contact, setContact] = useState(player.contact ?? "");

  if (editing) {
    return (
      <tr>
        <td>
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </td>
        <td>
          <Input
            label="Contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
        </td>
        <td colSpan={3}>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setEditing(false);
                setName(player.name);
                setContact(player.contact ?? "");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={name.trim().length === 0}
              onClick={() =>
                onAction(
                  () =>
                    apiFetch(`/api/players/${player.id}`, {
                      method: "PATCH",
                      body: {
                        name: name.trim(),
                        contact: contact.trim() || null,
                      },
                    }),
                  "Player updated",
                ).then(() => setEditing(false))
              }
            >
              Save
            </Button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td className="font-medium text-ink">{player.name}</td>
      <td className="text-muted">{player.contact ?? ""}</td>
      <td>
        <Toggle
          label={`Check in ${player.name}`}
          labelHidden
          checked={player.checkedIn}
          onChange={(checked) =>
            onAction(() =>
              apiFetch(`/api/players/${player.id}`, {
                method: "PATCH",
                body: { checkedIn: checked },
              }),
            )
          }
        />
      </td>
      <td>
        <PaymentSelect player={player} onAction={onAction} />
      </td>
      <td>
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-danger"
            onClick={() =>
              onAction(
                () =>
                  apiFetch(`/api/players/${player.id}`, { method: "DELETE" }),
                "Player removed",
              )
            }
          >
            Remove
          </Button>
        </div>
      </td>
    </tr>
  );
}

function PlayerCard({
  player,
  onAction,
}: {
  player: PlayerDTO;
  onAction: RunFn;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(player.name);
  const [contact, setContact] = useState(player.contact ?? "");

  return (
    <div className="flex flex-col gap-3 p-4">
      {editing ? (
        <>
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={name.trim().length === 0}
              onClick={() =>
                onAction(
                  () =>
                    apiFetch(`/api/players/${player.id}`, {
                      method: "PATCH",
                      body: {
                        name: name.trim(),
                        contact: contact.trim() || null,
                      },
                    }),
                  "Player updated",
                ).then(() => setEditing(false))
              }
            >
              Save
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">{player.name}</p>
              {player.contact && (
                <p className="truncate text-[13px] text-muted">
                  {player.contact}
                </p>
              )}
            </div>
            {player.paymentStatus === "PAID" ? (
              <Badge tone="positive">Paid</Badge>
            ) : (
              <Badge tone="danger">Unpaid</Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Toggle
              label="Checked in"
              checked={player.checkedIn}
              onChange={(checked) =>
                onAction(() =>
                  apiFetch(`/api/players/${player.id}`, {
                    method: "PATCH",
                    body: { checkedIn: checked },
                  }),
                )
              }
            />
            <PaymentSelect player={player} onAction={onAction} />
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-danger"
              onClick={() =>
                onAction(
                  () =>
                    apiFetch(`/api/players/${player.id}`, { method: "DELETE" }),
                  "Player removed",
                )
              }
            >
              Remove
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
