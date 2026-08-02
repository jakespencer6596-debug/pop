import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type Tone = "neutral" | "positive" | "danger" | "info" | "gold" | "warning";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-canvas text-body border-line",
  positive: "bg-positive/10 text-positive border-positive/25",
  danger: "bg-danger/10 text-danger border-danger/25",
  info: "bg-blue-tint text-brand border-brand/25",
  // Kingdom Gold reads as text only on the ink background
  gold: "bg-ink text-gold border-ink",
  warning: "bg-transparent text-warning border-warning/40",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const statusTone: Record<string, { tone: Tone; label: string }> = {
  SETUP: { tone: "neutral", label: "Setup" },
  ROUND_ROBIN: { tone: "info", label: "Round 1" },
  MONEY_ROUND: { tone: "gold", label: "Money round" },
  COMPLETED: { tone: "positive", label: "Completed" },
};

export function TournamentStatusBadge({ status }: { status: string }) {
  const s = statusTone[status] ?? { tone: "neutral" as Tone, label: status };
  return <Badge tone={s.tone}>{s.label}</Badge>;
}
