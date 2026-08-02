/** Strip a leading @ and surrounding whitespace from a Venmo handle. */
export function normalizeVenmoHandle(handle: string): string {
  return handle.trim().replace(/^@+/, "");
}

/** Venmo usernames are 5 to 30 characters: letters, numbers, hyphen, underscore. */
export function isValidVenmoHandle(handle: string): boolean {
  return /^[A-Za-z0-9_-]{5,30}$/.test(normalizeVenmoHandle(handle));
}

/** Payment link that pre-fills the recipient, amount, and note. */
export function venmoPayLink(
  handle: string,
  amountCents: number,
  note?: string | null,
): string {
  const user = normalizeVenmoHandle(handle);
  const params = new URLSearchParams({ txn: "pay" });
  if (amountCents > 0) {
    params.set("amount", (amountCents / 100).toFixed(2));
  }
  if (note && note.trim().length > 0) {
    params.set("note", note.trim());
  }
  return `https://venmo.com/${encodeURIComponent(user)}?${params.toString()}`;
}

/** Plain profile link fallback. */
export function venmoProfileLink(handle: string): string {
  return `https://venmo.com/u/${encodeURIComponent(normalizeVenmoHandle(handle))}`;
}
