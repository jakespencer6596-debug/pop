"use client";

import { cn } from "@/lib/cn";

export interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Hide the text label visually but keep it for screen readers. */
  labelHidden?: boolean;
}

export function Toggle({
  label,
  checked,
  onChange,
  disabled,
  labelHidden,
}: ToggleProps) {
  return (
    <label
      className={cn(
        "inline-flex items-center gap-2.5",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      )}
    >
      <span
        className={cn(
          "relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-brand" : "bg-line",
        )}
      >
        <input
          type="checkbox"
          role="switch"
          className="focus-ring absolute inset-0 h-full w-full cursor-[inherit] appearance-none rounded-full"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          aria-label={labelHidden ? label : undefined}
        />
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
            checked && "translate-x-4",
          )}
        />
      </span>
      {!labelHidden && (
        <span className="text-sm font-medium text-ink">{label}</span>
      )}
    </label>
  );
}
