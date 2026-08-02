import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/format";
import { SiteFooter } from "@/components/SiteFooter";
import {
  isValidVenmoHandle,
  venmoPayLink,
  venmoProfileLink,
} from "@/lib/engine/venmo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const t = await prisma.tournament.findUnique({
    where: { id },
    select: { name: true },
  });
  return { title: t ? `Pay for ${t.name}` : "Pay" };
}

export default async function PayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await prisma.tournament.findUnique({ where: { id } });
  if (!t) notFound();

  const hasVenmo = t.venmoHandle !== null && isValidVenmoHandle(t.venmoHandle);
  const payLink = hasVenmo
    ? venmoPayLink(t.venmoHandle!, t.entryFeeCents, t.venmoNote)
    : null;
  const profileLink = hasVenmo ? venmoProfileLink(t.venmoHandle!) : null;
  const qrDataUrl = payLink
    ? await QRCode.toDataURL(payLink, {
        width: 480,
        margin: 2,
        color: { dark: "#101820", light: "#FFFFFF" },
      })
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <main className="flex-1 px-4 py-8">
        <div className="mx-auto flex w-full max-w-md flex-col gap-5">
          <div>
            <p className="font-display text-lg font-bold tracking-tight text-ink">
              POP<span className="text-gold">.</span>
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold text-ink">
              {t.name}
            </h1>
            <p className="mt-1 text-sm text-muted">Entry payment</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[12px] border border-line bg-surface px-4 py-3">
              <p className="text-xs font-medium text-muted">Entry fee</p>
              <p className="tnum mt-1 font-display text-xl font-bold text-ink">
                {formatCents(t.entryFeeCents)}
              </p>
            </div>
            <div className="rounded-[12px] border border-line bg-surface px-4 py-3">
              <p className="text-xs font-medium text-muted">Prize pool</p>
              <p className="tnum mt-1 font-display text-xl font-bold text-ink">
                {formatCents(t.prizePoolCents)}
              </p>
            </div>
          </div>

          {hasVenmo && payLink ? (
            <div className="rounded-[12px] border border-line bg-surface p-5">
              <h2 className="font-display text-[15px] font-semibold text-ink">
                Pay with Venmo
              </h2>
              <p className="mt-1 text-[13px] text-body">
                The link and code below pre-fill the amount and note. Send to{" "}
                <span className="font-medium text-ink">@{t.venmoHandle}</span>.
              </p>
              <a
                href={payLink}
                className="focus-ring mt-4 flex h-11 items-center justify-center rounded-[8px] bg-brand text-sm font-medium text-white transition-colors hover:bg-brand-hover"
              >
                Open Venmo and pay {formatCents(t.entryFeeCents)}
              </a>
              {qrDataUrl && (
                <div className="mt-5 flex flex-col items-center gap-2">
                  {/* Data URL QR code, generated server-side from the pay link */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrDataUrl}
                    alt={`QR code that opens Venmo to pay @${t.venmoHandle}`}
                    className="w-full max-w-60 rounded-[8px] border border-line"
                  />
                  <p className="text-xs text-muted">
                    Or scan with your phone camera
                  </p>
                </div>
              )}
              {profileLink && (
                <p className="mt-4 text-center text-[13px] text-muted">
                  Trouble with the link? Find the profile at{" "}
                  <a
                    href={profileLink}
                    className="focus-ring font-medium text-info"
                  >
                    venmo.com/u/{t.venmoHandle}
                  </a>
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-[12px] border border-line bg-surface p-5">
              <h2 className="font-display text-[15px] font-semibold text-ink">
                Venmo
              </h2>
              <p className="mt-1 text-[13px] text-body">
                The organizer has not added a Venmo handle yet. Pay cash at the
                desk for now.
              </p>
            </div>
          )}

          <div className="rounded-[12px] border border-line bg-surface p-5">
            <h2 className="font-display text-[15px] font-semibold text-ink">
              Paying cash?
            </h2>
            <p className="mt-1 text-[13px] text-body">
              Cash is accepted at the desk. Tell the organizer when you pay so
              it gets recorded against your name.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
