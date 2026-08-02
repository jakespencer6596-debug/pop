import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage() {
  if (await isAdminSession()) {
    redirect("/");
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <p className="font-display text-2xl font-bold tracking-tight text-ink">
          POP<span className="text-brand">.</span>
        </p>
        <p className="mt-1 text-sm text-muted">
          Organizer sign in for the Pickleball Operating Platform.
        </p>
        <div className="mt-6 rounded-[12px] border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(14,26,43,0.04)]">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
