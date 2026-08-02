import { redirect } from "next/navigation";
import { isAdminSession } from "./session";

/**
 * Server component guard for admin pages. Redirects to /login when the
 * session is missing or expired.
 */
export async function requireAdminPage(): Promise<void> {
  const ok = await isAdminSession();
  if (!ok) {
    redirect("/login");
  }
}

/**
 * API route guard. Returns a 401 response when not authenticated, or null
 * when the caller may proceed.
 */
export async function requireAdminApi(): Promise<Response | null> {
  const ok = await isAdminSession();
  if (!ok) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }
  return null;
}
