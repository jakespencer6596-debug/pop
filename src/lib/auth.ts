import { redirect } from "next/navigation";
import { getSessionRole } from "./session";

/**
 * Server component guard for admin pages. Players are sent to their own
 * home; visitors without a session go to /login.
 */
export async function requireAdminPage(): Promise<void> {
  const role = await getSessionRole();
  if (role === "admin") return;
  redirect(role === "player" ? "/player" : "/login");
}

/** Guard for the player home: any signed-in role may view it. */
export async function requirePlayerPage(): Promise<void> {
  const role = await getSessionRole();
  if (role === null) {
    redirect("/login");
  }
}

/**
 * API route guard for mutations and admin reads. Only the admin role
 * passes; the player demo tier is read-only and uses public endpoints.
 */
export async function requireAdminApi(): Promise<Response | null> {
  const role = await getSessionRole();
  if (role !== "admin") {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }
  return null;
}
