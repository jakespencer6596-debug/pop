import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <p className="font-display text-lg font-bold tracking-tight text-ink">
          POP<span className="text-gold">.</span>
        </p>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">
          Privacy Policy
        </h1>
        <p className="mt-1 text-sm text-muted">Last updated August 2, 2026</p>

        <div className="mt-6 flex flex-col gap-5 text-sm leading-relaxed text-body">
          <section>
            <h2 className="font-display text-sm font-semibold text-ink">
              1. What we collect
            </h2>
            <p className="mt-1.5">
              POP stores the information organizers enter to run a tournament:
              player names, optional contact details, check-in status, scores,
              and whether an entry fee was recorded as paid. POP does not
              collect payment card numbers or bank details and does not process
              payments.
            </p>
          </section>
          <section>
            <h2 className="font-display text-sm font-semibold text-ink">
              2. Cookies
            </h2>
            <p className="mt-1.5">
              POP sets a single session cookie so the organizer can stay signed
              in. It is not used for advertising or cross-site tracking, and
              there are no third-party analytics scripts on the site.
            </p>
          </section>
          <section>
            <h2 className="font-display text-sm font-semibold text-ink">
              3. What is public
            </h2>
            <p className="mt-1.5">
              Player names, schedules, scores, and standings appear on public
              live pages for anyone with the tournament link. Contact details
              and payment records are never shown on public pages.
            </p>
          </section>
          <section>
            <h2 className="font-display text-sm font-semibold text-ink">
              4. How information is used
            </h2>
            <p className="mt-1.5">
              Information is used only to run the tournament it belongs to. We
              do not sell personal information or share it with third parties,
              except for the hosting infrastructure that runs the service.
            </p>
          </section>
          <section>
            <h2 className="font-display text-sm font-semibold text-ink">
              5. Retention and removal
            </h2>
            <p className="mt-1.5">
              Tournament data is kept so organizers can refer back to past
              events. Deleting a tournament permanently removes its players,
              games, and payment records. Players can ask their organizer to
              correct or remove their information at any time.
            </p>
          </section>
          <section>
            <h2 className="font-display text-sm font-semibold text-ink">
              6. Contact
            </h2>
            <p className="mt-1.5">
              Privacy questions can be sent through{" "}
              <a
                href="https://spencerinv.com"
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring font-medium text-info"
              >
                spencerinv.com
              </a>
              .
            </p>
          </section>
          <p>
            See also the{" "}
            <Link href="/terms" className="focus-ring font-medium text-info">
              Terms of Service
            </Link>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
