import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type SessionRole = "admin" | "player";

export interface SessionData {
  role?: SessionRole;
  /** Kept for sessions issued before roles existed. */
  isAdmin?: boolean;
}

export const SESSION_COOKIE = "pop_session";

function sessionOptions(): SessionOptions {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters");
  }
  return {
    cookieName: SESSION_COOKIE,
    password: secret,
    ttl: 60 * 60 * 12, // 12 hours
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  };
}

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions());
}

export async function getSessionRole(): Promise<SessionRole | null> {
  const session = await getSession();
  if (session.role === "admin" || session.isAdmin === true) return "admin";
  if (session.role === "player") return "player";
  return null;
}

export async function isAdminSession(): Promise<boolean> {
  return (await getSessionRole()) === "admin";
}
