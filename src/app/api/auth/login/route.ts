import { getSession } from "@/lib/session";
import { z } from "zod";

const bodySchema = z.object({
  password: z.string().min(1, "Enter the password."),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Enter the password." }, { status: 400 });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return Response.json(
      { error: "Server is missing ADMIN_PASSWORD." },
      { status: 500 },
    );
  }
  const playerPassword = process.env.PLAYER_PASSWORD;

  let role: "admin" | "player";
  if (parsed.data.password === adminPassword) {
    role = "admin";
  } else if (playerPassword && parsed.data.password === playerPassword) {
    role = "player";
  } else {
    return Response.json({ error: "Wrong password." }, { status: 401 });
  }

  const session = await getSession();
  session.role = role;
  session.isAdmin = role === "admin";
  await session.save();
  return Response.json({ ok: true, role });
}
