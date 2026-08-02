"use client";

import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";

const noopSubscribe = () => () => {};

/** The page origin, empty during server rendering. */
function useOrigin(): string {
  return useSyncExternalStore(
    noopSubscribe,
    () => window.location.origin,
    () => "",
  );
}

export function CopyLinkRow({ label, path }: { label: string; path: string }) {
  const url = `${useOrigin()}${path}`;
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-36 shrink-0 text-[13px] font-medium text-ink">
        {label}
      </span>
      <code className="tnum min-w-0 flex-1 truncate rounded-[8px] border border-line bg-canvas px-3 py-2 text-[13px] text-body">
        {url}
      </code>
      <Button
        variant="secondary"
        size="sm"
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}
