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

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return Response.json(
      { error: "Server is missing ADMIN_PASSWORD." },
      { status: 500 },
    );
  }
  if (parsed.data.password !== expected) {
    return Response.json({ error: "Wrong password." }, { status: 401 });
  }

  const session = await getSession();
  session.isAdmin = true;
  await session.save();
  return Response.json({ ok: true });
}
