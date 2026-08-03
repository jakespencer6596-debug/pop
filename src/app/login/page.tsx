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
    <div className="flex min-h-screen flex-col bg-canvas">
      <main className="flex flex-1 flex-col lg:flex-row">
        <section className="relative flex min-h-80 flex-col items-center justify-start overflow-hidden bg-ink px-6 pt-10 pb-6 lg:min-h-0 lg:w-1/2 lg:justify-center lg:px-16 lg:py-0">
          <CourtScene />
          <div className="relative z-10 lg:-translate-y-40">
            <Image
              src="/brand/pop-logo.png"
              alt="POP, the Pickleball Operating Platform"
              width={1200}
              height={398}
              priority
              className="w-60 lg:w-[400px]"
            />
          </div>
        </section>
        <section className="flex flex-1 items-center justify-center px-4 py-10 lg:py-0">
          <div className="w-full max-w-sm">
            <h1 className="font-display text-lg font-bold text-ink">Sign in</h1>
            <p className="mt-1 text-[13px] text-muted">
              Use the password you were given. Organizers get the full console;
              players get the live view.
            </p>
            <div className="mt-4 rounded-[12px] border border-line bg-surface p-5 shadow-[0_10px_30px_rgba(16,24,32,0.08)]">
              <LoginForm />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
