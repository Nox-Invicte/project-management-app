import type { Response } from "express";
import type { ZodType } from "zod";

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status = 500,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function parseBody<T>(schema: ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new HttpError(result.error.issues[0]?.message ?? "Invalid request body.", 400);
  }
  return result.data;
}

export function sendData<T>(response: Response, data: T, status = 200) {
  return response.status(status).json({ data });
}

export function toUser(user: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}) {
  const name = user.user_metadata?.full_name;
  return {
    id: user.id,
    email: user.email ?? "",
    fullName: typeof name === "string" ? name : "",
  };
}

export function sendSupabaseError(error: { message: string; status?: number }, fallbackStatus = 400): never {
  const status = error.status && error.status >= 400 && error.status < 500 ? error.status : fallbackStatus;
  throw new HttpError(error.message, status);
}
