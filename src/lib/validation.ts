import { z } from "zod";
import { isValidVenmoHandle, normalizeVenmoHandle } from "@/lib/engine/venmo";

const optionalTrimmed = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((s) => (s.length === 0 ? null : s))
    .nullable()
    .optional();

export const tournamentFields = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  venue: optionalTrimmed(100),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .transform((s) => new Date(`${s}T00:00:00.000Z`))
    .nullable()
    .optional(),
  numCourts: z.number().int().min(1).max(12),
  gameTarget: z.number().int().min(1).max(99),
  winByTwo: z.boolean(),
  roundRobinGames: z.number().int().min(1).max(12),
  numAdvancing: z.number().int().min(2).max(16),
  moneyRoundFormat: z.enum(["ROUND_ROBIN", "BRACKET"]),
  moneyRoundMatchType: z.enum(["SINGLES", "DOUBLES"]),
  moneyRoundGames: z.number().int().min(1).max(12),
  entryFeeCents: z.number().int().min(0).max(1_000_000),
  prizePoolCents: z.number().int().min(0).max(10_000_000),
  venmoHandle: optionalTrimmed(31).refine(
    (v) => v === null || v === undefined || isValidVenmoHandle(v),
    "Venmo handles are 5 to 30 letters, numbers, hyphens, or underscores",
  ),
  venmoNote: optionalTrimmed(120),
});

export const tournamentCreateSchema = tournamentFields
  .partial()
  .extend({ name: tournamentFields.shape.name })
  .transform(normalizeHandle);

export const tournamentPatchSchema = tournamentFields
  .partial()
  .transform(normalizeHandle);

function normalizeHandle<T extends { venmoHandle?: string | null }>(
  data: T,
): T {
  if (typeof data.venmoHandle === "string") {
    return { ...data, venmoHandle: normalizeVenmoHandle(data.venmoHandle) };
  }
  return data;
}

export const playerCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  contact: optionalTrimmed(100),
});

export const playerPatchSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  contact: optionalTrimmed(100),
  checkedIn: z.boolean().optional(),
});

export const paymentPatchSchema = z
  .object({
    paymentStatus: z.enum(["PAID", "UNPAID"]),
    paymentMethod: z.enum(["VENMO", "CASH"]).nullable().optional(),
  })
  .refine(
    (data) => data.paymentStatus === "UNPAID" || data.paymentMethod != null,
    { message: "Pick Venmo or cash when marking a player paid" },
  );

export const scheduleGenerateSchema = z.object({
  seed: z.number().int().min(1).max(1_000_000).optional(),
});

export const gamePatchSchema = z
  .object({
    scoreA: z.number().int().min(0).max(99).nullable().optional(),
    scoreB: z.number().int().min(0).max(99).nullable().optional(),
    status: z.enum(["SCHEDULED", "IN_PROGRESS", "FINAL"]).optional(),
    /** Allow a score that fails target or win-by-two validation. */
    override: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Nothing to update",
  });

export function parseError(result: { error: z.ZodError }): string {
  return result.error.issues[0]?.message ?? "Invalid input";
}
