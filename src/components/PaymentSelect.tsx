"use client";

import { apiFetch } from "@/lib/api";
import type { PlayerDTO } from "@/lib/types";

type RunFn = (
  action: () => Promise<unknown>,
  success?: string,
) => Promise<void>;

function currentValue(player: PlayerDTO): string {
  if (player.paymentStatus === "UNPAID") return "UNPAID";
  return player.paymentMethod === "CASH" ? "PAID_CASH" : "PAID_VENMO";
}

/** Quick action to mark a player paid by Venmo, paid by cash, or unpaid. */
export function PaymentSelect({
  player,
  onAction,
}: {
  player: PlayerDTO;
  onAction: RunFn;
}) {
  return (
    <select
      aria-label={`Payment status for ${player.name}`}
      className="focus-ring h-8 rounded-[8px] border border-line bg-surface px-2 text-[13px] text-ink"
      value={currentValue(player)}
      onChange={(e) => {
        const value = e.target.value;
        const body =
          value === "UNPAID"
            ? { paymentStatus: "UNPAID", paymentMethod: null }
            : {
                paymentStatus: "PAID",
                paymentMethod: value === "PAID_CASH" ? "CASH" : "VENMO",
              };
        onAction(() =>
          apiFetch(`/api/players/${player.id}/payment`, {
            method: "PATCH",
            body,
          }),
        );
      }}
    >
      <option value="UNPAID">Unpaid</option>
      <option value="PAID_VENMO">Paid by Venmo</option>
      <option value="PAID_CASH">Paid by cash</option>
    </select>
  );
}
