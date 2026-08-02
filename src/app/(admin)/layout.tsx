import { requireAdminPage } from "@/lib/auth";
import { ToastProvider } from "@/components/ui/Toast";
import { AdminHeader } from "@/components/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPage();
  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col">
        <AdminHeader />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
