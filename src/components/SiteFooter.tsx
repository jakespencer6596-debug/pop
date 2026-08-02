import Link from "next/link";
import { cn } from "@/lib/cn";

/** Site-wide footer: maker credit and legal links. */
export function SiteFooter({ dark }: { dark?: boolean }) {
  const linkClass = cn(
    dark
      ? "focus-ring-dark text-night-muted hover:text-white"
      : "focus-ring text-muted hover:text-ink",
    "transition-colors",
  );
  return (
    <footer
      className={cn(
        "no-print mt-auto border-t px-4 py-4",
        dark ? "border-white/10 bg-night" : "border-line bg-surface",
      )}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 text-xs">
        <a
          href="https://spencerinv.com"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          Made by Spencer Innovations
        </a>
        <nav aria-label="Legal" className="flex gap-4">
          <Link href="/terms" className={linkClass}>
            Terms of Service
          </Link>
          <Link href="/privacy" className={linkClass}>
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
