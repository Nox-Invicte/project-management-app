import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type ApiRequestOptions = RequestInit & { auth?: boolean };

const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { auth = true, headers: initHeaders, ...init } = options;
  const headers = new Headers(initHeaders);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  if (auth) {
    const { data, error } = await createSupabaseBrowserClient().auth.getSession();
    if (error) throw error;
    const token = data.session?.access_token;
    if (!token) throw new Error("Your session has expired. Please sign in again.");
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${apiUrl}/api${path}`, { ...init, headers, cache: "no-store" });
  } catch {
    throw new Error("Could not reach the API. Check your connection and try again.");
  }

  if (response.status === 204) return undefined as T;
  const payload = await response.json().catch(() => null) as { data?: T; error?: { message?: string } } | null;
  if (!response.ok) {
    throw new Error(payload?.error?.message ?? `The request failed (${response.status}).`);
  }
  return payload?.data as T;
}
