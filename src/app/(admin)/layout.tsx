import Link from "next/link";
import { requireAdminPage } from "@/lib/auth";
import { ToastProvider } from "@/components/ui/Toast";
import { LogoutButton } from "@/components/LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPage();
  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col">
        <header className="no-print sticky top-0 z-30 border-b border-line bg-surface">
          <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="focus-ring font-display text-lg font-bold tracking-tight text-ink"
              >
                POP<span className="text-brand">.</span>
              </Link>
              <nav aria-label="Primary">
                <Link
                  href="/"
                  className="focus-ring text-sm font-medium text-body hover:text-ink"
                >
                  Tournaments
                </Link>
              </nav>
            </div>
            <LogoutButton />
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
