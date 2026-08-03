"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Dark-themed sign-in form for the court login page. */
export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const data = (await res.json().catch(() => null)) as {
          role?: string;
        } | null;
        router.push(data?.role === "player" ? "/player" : "/");
        router.refresh();
        return;
      }
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error ?? "Could not log in.");
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="login-password"
          className="text-[13px] font-medium text-white"
        >
          Password
        </label>
        <input
          id="login-password"
          type="password"
          name="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={error ? true : undefined}
          className="focus-ring-dark h-11 w-full rounded-[8px] border border-white/15 bg-ink px-3 text-sm text-white placeholder:text-night-muted"
        />
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
      <button
        type="submit"
        disabled={busy || password.length === 0}
        className="focus-ring-dark inline-flex h-11 items-center justify-center rounded-[8px] bg-brand text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-brand/40"
      >
        {busy ? "Signing in" : "Sign in"}
      </button>
    </form>
  );
}
