import { Router } from "express";
import { HttpError, parseBody, sendData, sendSupabaseError, toUser } from "../http";
import { requireAuth } from "../middleware";
import { createPublicSupabaseClient } from "../supabase";
import { loginSchema, refreshSchema, registerSchema } from "../validation";

const router = Router();

function serializeSession(session: {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  token_type: string;
}) {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at ?? null,
    tokenType: session.token_type,
  };
}

router.post("/register", async (request, response) => {
  const input = parseBody(registerSchema, request.body);
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: { full_name: input.fullName } },
  });
  if (error) sendSupabaseError(error);
  if (!data.user) throw new HttpError("Could not create the account.", 400);

  return sendData(response, {
    user: toUser(data.user),
    session: data.session ? serializeSession(data.session) : null,
    emailConfirmationRequired: !data.session,
  }, 201);
});

router.post("/login", async (request, response) => {
  const input = parseBody(loginSchema, request.body);
  const { data, error } = await createPublicSupabaseClient().auth.signInWithPassword(input);
  if (error) sendSupabaseError(error, 401);
  if (!data.user || !data.session) throw new HttpError("Could not create a session.", 401);

  return sendData(response, { user: toUser(data.user), session: serializeSession(data.session) });
});

router.post("/refresh", async (request, response) => {
  const input = parseBody(refreshSchema, request.body);
  const { data, error } = await createPublicSupabaseClient().auth.refreshSession({
    refresh_token: input.refreshToken,
  });
  if (error) sendSupabaseError(error, 401);
  if (!data.user || !data.session) throw new HttpError("Your session has expired. Please sign in again.", 401);

  return sendData(response, { user: toUser(data.user), session: serializeSession(data.session) });
});

router.post("/logout", requireAuth, async (request, response) => {
  const { refreshToken } = parseBody(refreshSchema, request.body);
  const supabase = createPublicSupabaseClient();
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: request.accessToken!,
    refresh_token: refreshToken,
  });
  if (sessionError) sendSupabaseError(sessionError, 401);
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) sendSupabaseError(error, 401);
  return response.status(204).end();
});

router.get("/me", requireAuth, (request, response) => {
  if (!request.authUser) throw new HttpError("Not authenticated.", 401);
  return sendData(response, toUser(request.authUser));
});

export default router;
