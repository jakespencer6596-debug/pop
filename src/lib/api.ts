"use client";

export class ApiError extends Error {
  status: number;
  needsOverride: boolean;

  constructor(message: string, status: number, needsOverride = false) {
    super(message);
    this.status = status;
    this.needsOverride = needsOverride;
  }
}

/** JSON fetch wrapper that throws an ApiError with the server's message. */
export async function apiFetch<T = unknown>(
  url: string,
  options?: { method?: string; body?: unknown },
): Promise<T> {
  const res = await fetch(url, {
    method: options?.method ?? "GET",
    headers:
      options?.body !== undefined
        ? { "Content-Type": "application/json" }
        : undefined,
    body:
      options?.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  const data = (await res.json().catch(() => null)) as
    (T & { error?: string; needsOverride?: boolean }) | null;
  if (!res.ok) {
    throw new ApiError(
      data?.error ?? `Request failed (${res.status})`,
      res.status,
      data?.needsOverride ?? false,
    );
  }
  return data as T;
}

export const swrFetcher = <T>(url: string) => apiFetch<T>(url);
