import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-[12px] border border-dashed border-line bg-surface px-6 py-10 text-center">
      <p className="font-display text-[15px] font-semibold text-ink">{title}</p>
      {description && (
        <p className="max-w-sm text-[13px] text-muted">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
