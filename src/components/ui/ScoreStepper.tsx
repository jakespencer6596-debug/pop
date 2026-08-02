"use client";

import { cn } from "@/lib/cn";

/**
 * Score input built for fast courtside entry on a phone: large tap targets,
 * numeric keypad, and single-tap increment and decrement.
 */
export function ScoreStepper({
  label,
  value,
  onChange,
  disabled,
  max = 99,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
  max?: number;
}) {
  const current = value ?? 0;

  const set = (n: number) => {
    onChange(Math.max(0, Math.min(max, n)));
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-xs font-medium text-muted">{label}</span>
      <div
        className={cn(
          "flex items-center overflow-hidden rounded-[8px] border border-line bg-surface",
          disabled && "opacity-50",
        )}
      >
        <button
          type="button"
          aria-label={`Decrease ${label} score`}
          className="focus-ring h-12 w-12 text-xl font-semibold text-body hover:bg-canvas disabled:cursor-not-allowed"
          onClick={() => set(current - 1)}
          disabled={disabled || current <= 0}
        >
          -
        </button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          aria-label={`${label} score`}
          className="focus-ring tnum h-12 w-14 border-x border-line bg-surface text-center text-xl font-semibold text-ink"
          value={value === null ? "" : String(value)}
          placeholder="0"
          disabled={disabled}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, "");
            if (raw === "") onChange(null);
            else set(parseInt(raw, 10));
          }}
        />
        <button
          type="button"
          aria-label={`Increase ${label} score`}
          className="focus-ring h-12 w-12 text-xl font-semibold text-body hover:bg-canvas disabled:cursor-not-allowed"
          onClick={() => set(current + 1)}
          disabled={disabled || current >= max}
        >
          +
        </button>
      </div>
    </div>
  );
}
