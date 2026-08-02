"use client";

import { useTournament } from "@/lib/useTournament";
import { formatCents } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { PaymentSelect } from "@/components/PaymentSelect";

export function PaymentsTab({ tournamentId }: { tournamentId: string }) {
  const { data, mutate, isLoading } = useTournament(tournamentId);
  const toast = useToast();

  if (isLoading || !data) {
    return <p className="py-8 text-center text-sm text-muted">Loading</p>;
  }

  const fee = data.entryFeeCents;
  const paidPlayers = data.players.filter((p) => p.paymentStatus === "PAID");
  const venmoCount = paidPlayers.filter(
    (p) => p.paymentMethod === "VENMO",
  ).length;
  const cashCount = paidPlayers.filter(
    (p) => p.paymentMethod === "CASH",
  ).length;
  const expected = fee * data.players.length;
  const collected = fee * paidPlayers.length;
  const outstanding = expected - collected;
  const owing = data.players.filter((p) => p.paymentStatus === "UNPAID");

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

  const stats = [
    { label: "Entry fee", value: formatCents(fee) },
    { label: "Expected", value: formatCents(expected) },
    { label: "Collected", value: formatCents(collected) },
    { label: "Outstanding", value: formatCents(outstanding) },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="px-4 py-3">
            <p className="text-xs font-medium text-muted">{s.label}</p>
            <p className="tnum mt-1 font-display text-xl font-bold text-ink">
              {s.value}
            </p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader
          title="Collected by method"
          description="Venmo payments are declared through the pay page or in person. Cash is recorded at the desk."
        />
        <CardBody className="grid grid-cols-2 gap-3">
          <div className="rounded-[8px] border border-line bg-canvas px-4 py-3">
            <p className="text-xs font-medium text-muted">Venmo</p>
            <p className="tnum mt-1 text-lg font-semibold text-ink">
              {formatCents(fee * venmoCount)}
            </p>
            <p className="text-xs text-muted">
              {venmoCount} {venmoCount === 1 ? "player" : "players"}
            </p>
          </div>
          <div className="rounded-[8px] border border-line bg-canvas px-4 py-3">
            <p className="text-xs font-medium text-muted">Cash</p>
            <p className="tnum mt-1 text-lg font-semibold text-ink">
              {formatCents(fee * cashCount)}
            </p>
            <p className="text-xs text-muted">
              {cashCount} {cashCount === 1 ? "player" : "players"}
            </p>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Per player"
          description={
            owing.length === 0
              ? "Everyone is paid up."
              : `${owing.length} ${owing.length === 1 ? "player still owes" : "players still owe"} the entry fee.`
          }
        />
        {data.players.length === 0 ? (
          <CardBody>
            <EmptyState
              title="No players yet"
              description="Add players on the Players tab to track payments."
            />
          </CardBody>
        ) : (
          <div className="overflow-x-auto">
            <table className="pop-table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Status</th>
                  <th className="num">Owed</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {[...data.players]
                  .sort((a, b) =>
                    a.paymentStatus === b.paymentStatus
                      ? a.name.localeCompare(b.name)
                      : a.paymentStatus === "UNPAID"
                        ? -1
                        : 1,
                  )
                  .map((p) => (
                    <tr key={p.id}>
                      <td className="font-medium text-ink">{p.name}</td>
                      <td>
                        {p.paymentStatus === "PAID" ? (
                          <Badge tone="positive">
                            Paid
                            {p.paymentMethod === "CASH"
                              ? " by cash"
                              : p.paymentMethod === "VENMO"
                                ? " by Venmo"
                                : ""}
                          </Badge>
                        ) : (
                          <Badge tone="danger">Unpaid</Badge>
                        )}
                      </td>
                      <td className="num">
                        {p.paymentStatus === "PAID"
                          ? formatCents(0)
                          : formatCents(fee)}
                      </td>
                      <td>
                        <PaymentSelect player={p} onAction={run} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
