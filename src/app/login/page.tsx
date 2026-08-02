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
    <main className="flex min-h-screen flex-col bg-canvas lg:flex-row">
      <section className="flex flex-col justify-center bg-ink px-6 py-6 lg:w-1/2 lg:px-16 lg:py-0">
        <p className="font-display text-3xl font-bold tracking-tight text-white lg:text-5xl">
          POP<span className="text-gold">.</span>
        </p>
        <p className="mt-2 max-w-sm text-sm text-white/70 lg:mt-4 lg:text-base">
          The operating platform for pop-up pickleball tournaments.
        </p>
      </section>
      <section className="flex flex-1 items-center justify-center px-4 py-10 lg:py-0">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-lg font-bold text-ink">
            Organizer sign in
          </h1>
          <div className="mt-4 rounded-[12px] border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(16,24,32,0.04)]">
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
