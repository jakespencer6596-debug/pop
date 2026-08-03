import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSessionRole } from "@/lib/session";
import { CourtScene } from "@/components/CourtScene";
import { SiteFooter } from "@/components/SiteFooter";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage() {
  const role = await getSessionRole();
  if (role === "admin") redirect("/");
  if (role === "player") redirect("/player");
  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <main className="relative flex flex-1 flex-col items-center overflow-hidden px-4 pt-10 pb-16 sm:pt-14">
        <CourtScene />
        <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
          <Image
            src="/brand/pop-logo.png"
            alt="POP, the Pickleball Operating Platform"
            width={1200}
            height={398}
            priority
            className="w-56 sm:w-72"
          />
          <div className="mt-8 w-full rounded-[12px] border border-white/10 bg-night-surface/95 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:mt-10 sm:p-6">
            <h1 className="font-display text-base font-bold text-white">
              Sign in
            </h1>
            <p className="mt-1 text-[13px] leading-relaxed text-night-muted">
              Use the password you were given. Organizers get the full console;
              players get the live view.
            </p>
            <div className="mt-4">
              <LoginForm />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter dark />
    </div>
  );
}
