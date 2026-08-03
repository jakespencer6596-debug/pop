import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <Image
          src="/brand/pop-tile.png"
          alt="POP"
          width={512}
          height={512}
          className="h-10 w-10 rounded-[8px]"
        />
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">
          Terms of Service
        </h1>
        <p className="mt-1 text-sm text-muted">Last updated August 2, 2026</p>

        <div className="mt-6 flex flex-col gap-5 text-sm leading-relaxed text-body">
          <section>
            <h2 className="font-display text-sm font-semibold text-ink">
              1. What POP is
            </h2>
            <p className="mt-1.5">
              POP (Pickleball Operating Platform) is software for organizing and
              running pop-up pickleball tournaments, including schedules,
              scores, standings, and event information pages. It is operated by
              Spencer Innovations. By using POP you agree to these terms.
            </p>
          </section>
          <section>
            <h2 className="font-display text-sm font-semibold text-ink">
              2. Organizer access
            </h2>
            <p className="mt-1.5">
              Organizer access is protected by a password. Organizers are
              responsible for keeping that password private and for the accuracy
              of the information they enter, including player names, scores, and
              payment records.
            </p>
          </section>
          <section>
            <h2 className="font-display text-sm font-semibold text-ink">
              3. Payments
            </h2>
            <p className="mt-1.5">
              POP does not process, hold, or transfer money. Payment pages
              display the organizer&apos;s Venmo details and track payments that
              players and organizers report themselves. Any payment dispute is
              between the player and the organizer. Venmo is a service of its
              own provider and has its own terms.
            </p>
          </section>
          <section>
            <h2 className="font-display text-sm font-semibold text-ink">
              4. Public pages
            </h2>
            <p className="mt-1.5">
              Live leaderboards, matchups, results, and pay pages are visible to
              anyone with the link. Do not enter information into a tournament
              that should not appear on a public page.
            </p>
          </section>
          <section>
            <h2 className="font-display text-sm font-semibold text-ink">
              5. Acceptable use
            </h2>
            <p className="mt-1.5">
              Do not misuse the service, attempt to access other
              organizers&apos; data, disrupt its operation, or use it for
              anything unlawful.
            </p>
          </section>
          <section>
            <h2 className="font-display text-sm font-semibold text-ink">
              6. No warranty
            </h2>
            <p className="mt-1.5">
              POP is provided as is, without warranties of any kind. To the
              fullest extent permitted by law, Spencer Innovations is not liable
              for indirect or consequential damages arising from use of the
              service, and its total liability for any claim is limited to the
              amount you paid to use POP, if any.
            </p>
          </section>
          <section>
            <h2 className="font-display text-sm font-semibold text-ink">
              7. Changes
            </h2>
            <p className="mt-1.5">
              We may update the service and these terms. Material changes will
              be reflected on this page with a new date. Continued use after a
              change means you accept the updated terms.
            </p>
          </section>
          <section>
            <h2 className="font-display text-sm font-semibold text-ink">
              8. Contact
            </h2>
            <p className="mt-1.5">
              Questions about these terms can be sent through{" "}
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
            <Link href="/privacy" className="focus-ring font-medium text-info">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
