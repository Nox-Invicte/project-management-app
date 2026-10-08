# Taskflow Project Management

Taskflow is a Next.js web client and an Express REST API backed by Supabase Auth and PostgreSQL. The Android app can use the same API and accounts; add it as a separate Expo app under `mobile/`.

## Prerequisites

- Node.js 22 or later and npm
- A Supabase project with the schema in `supabase/schema.sql` applied

## Local setup

1. Copy `.env.example` to `.env` and fill in your Supabase project URL and publishable key. Use the same project values in both the `NEXT_PUBLIC_*` and server variables.
2. Apply `supabase/schema.sql` in the Supabase SQL editor.
3. Install dependencies with `npm install`.
4. Start the API and web app in separate terminals:

   ```sh
   npm run api:dev
   npm run dev
   ```

The web app runs at `http://localhost:3000`; the API runs at `http://localhost:4000`. Check `http://localhost:4000/health` for API status. `NEXT_PUBLIC_API_URL` defaults to the local API if omitted.

## API and mobile client

See [docs/API.md](docs/API.md) for endpoints, payloads, authentication, response shapes, and Android development notes. The API validates Supabase access tokens and makes user-scoped database requests so the existing row-level security policies continue to apply.

The Android client should store `accessToken` and `refreshToken` using Expo SecureStore, send the access token as a bearer token, and call `POST /api/auth/refresh` when necessary. Do not bundle a service-role key.

## Production

- Set the Supabase variables, `PORT`, and `CORS_ORIGINS` in the API host environment.
- Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SUPABASE_*` in the web host environment.
- Build the API with `npm run api:build`; run it with `npm run api:start`.
- Configure `CORS_ORIGINS` with the exact deployed web origin(s), comma-separated if needed.
- Configure mobile with the deployed API base URL. Native Android requests are not subject to browser CORS, but web requests are.

## Project structure

- `src/`: Next.js web application
- `server/src/`: Express API
- `supabase/schema.sql`: PostgreSQL tables, constraints, and row-level security policies
- `docs/API.md`: Android/web REST contract
- `PROJECT_MEMORY.md`: summarized assignment requirements and project plan
