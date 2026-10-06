# Taskflow

Taskflow is a Next.js project and task manager backed by Supabase Auth and Postgres.

## Setup

1. Create a Supabase project and run [`supabase/schema.sql`](./supabase/schema.sql) in the SQL editor.
2. Copy [`.env.example`](./.env.example) to `.env.local` and fill in the project URL and anon key from **Project settings → API**.
3. In Supabase Auth settings, choose whether email confirmation is required.
4. Install and run the app:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Register with a full name, unique email, and an 8+ character password. Supabase stores passwords securely and maintains the browser session; unauthenticated users are redirected to `/login`.

## Features

- Email/password registration, login, logout, email confirmation support, and persistent Supabase sessions.
- Dashboard totals for projects, tasks, completed tasks, and projects in progress.
- Project and task create, edit, delete, and task completion actions.
- Search across projects/tasks, project status filtering, and task status/priority filtering.
- Responsive workspace layout for desktop and mobile browsers.

## Data and security

Supabase Auth owns the `auth.users` table, password hashing, email uniqueness, sessions, and token expiry. The SQL script only creates `projects` and `tasks`; it does not create a users or passwords table. Every project and task has an `owner_id` referencing `auth.users(id)`, and RLS policies require `auth.uid()` to match that owner. Tasks can only reference projects owned by the current user. Projects cascade-delete their tasks.

To populate safe sample data for the currently signed-in user, run `select public.seed_demo_data();` in the SQL editor. The function is idempotent and does not create users.

### Security controls

- **JWT authentication:** Supabase Auth issues and refreshes signed JWT access tokens. The browser client sends them through the Supabase SDK; no custom JWT or password table is used.
- **Protected routes:** [`src/proxy.ts`](./src/proxy.ts) refreshes the Supabase session and redirects unauthenticated users away from dashboard, project, and task routes. It also redirects authenticated users away from login and registration.
- **Authorization:** Postgres RLS checks `auth.uid() = owner_id` for every project/task operation, including cross-project task ownership checks.
- **SQL injection protection:** Data access uses Supabase PostgREST methods (`select`, `insert`, `update`, `delete`, and `eq`) rather than interpolated SQL. Supabase parameterizes these requests.
- **Sensitive responses:** The application only selects project/task fields and user metadata needed by the UI. Passwords and Auth internals remain in Supabase Auth and are never returned by the app.
- **Authentication rate limiting:** Supabase Auth applies server-side rate limits to sign-up and password sign-in endpoints. Review and adjust them in Supabase Dashboard → Authentication → Rate Limits. The UI also disables each auth form while its request is in progress.
