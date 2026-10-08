import type { NextFunction, Request, Response } from "express";
import { createPublicSupabaseClient, createUserSupabaseClient } from "./supabase";
import { HttpError } from "./http";

export async function requireAuth(request: Request, _response: Response, next: NextFunction) {
  try {
    const authorization = request.header("authorization");
    const match = authorization?.match(/^Bearer\s+(.+)$/i);
    if (!match) throw new HttpError("A valid bearer token is required.", 401);

    const accessToken = match[1];
    const { data, error } = await createPublicSupabaseClient().auth.getUser(accessToken);
    if (error || !data.user) throw new HttpError("Your session is invalid or expired. Please sign in again.", 401);

    request.authUser = data.user;
    request.accessToken = accessToken;
    request.userSupabase = createUserSupabaseClient(accessToken);
    next();
  } catch (error) {
    next(error);
  }
}
