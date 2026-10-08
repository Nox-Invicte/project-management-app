# Taskflow REST API

Base URL: `http://localhost:4000` locally. API routes are prefixed with `/api`. The health endpoint is `GET /health`.

Successful JSON responses use `{ "data": ... }`. Errors use `{ "error": { "message": "..." } }`. A `204 No Content` response has an empty body. Dates use `YYYY-MM-DD`; status and priority strings are case-sensitive.

## Authentication

Registration and login issue Supabase Auth access and refresh tokens. Store both tokens securely in Android (Expo SecureStore backed by Android Keystore), and send the access token with protected calls:

```http
Authorization: Bearer <accessToken>
```

When an API call returns `401`, use `POST /api/auth/refresh` with the refresh token. Replace both saved tokens with the returned values. If refresh also returns `401`, clear secure storage and show the login screen with a session-expired message. On logout, call the endpoint if online, then always delete both tokens locally.

### `POST /api/auth/register`

Request:

```json
{ "fullName": "Test User", "email": "test@example.com", "password": "example-password" }
```

Returns `201` with `user`, nullable `session`, and `emailConfirmationRequired`. If email confirmation is enabled in Supabase, show a confirmation message when `session` is `null`.

### `POST /api/auth/login`

Request: `{ "email": "test@example.com", "password": "example-password" }`.

Returns `user` and `session` containing `accessToken`, `refreshToken`, `expiresAt`, and `tokenType`.

### `POST /api/auth/refresh`

Request: `{ "refreshToken": "..." }`. Returns the updated `user` and `session` token pair.

### `POST /api/auth/logout`

Protected. Send `{ "refreshToken": "..." }`; returns `204` after revoking the refresh session. Always clear local tokens. An already copied Supabase access JWT may remain valid until its expiry; never retain or log tokens.

### `GET /api/auth/me`

Protected. Returns `{ "id", "email", "fullName" }` for the token owner.

## Projects

All project routes require a bearer token. List filters are optional query parameters.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/projects` | List owned projects; supports `search` and `status` |
| `GET` | `/api/projects/{projectId}` | Get one owned project |
| `POST` | `/api/projects` | Create a project |
| `PUT` | `/api/projects/{projectId}` | Replace editable project fields |
| `PATCH` | `/api/projects/{projectId}/status` | Update project status |
| `DELETE` | `/api/projects/{projectId}` | Delete project and its tasks |

Project create/update body:

```json
{
  "name": "Website refresh",
  "description": "Marketing site sprint",
  "status": "In Progress",
  "startDate": "2026-10-08",
  "endDate": "2026-10-30"
}
```

Allowed statuses: `Not Started`, `In Progress`, `Completed`. `startDate` defaults to the database current date; `endDate` can be omitted or `null`.

## Tasks

All task routes require a bearer token. List filters are optional query parameters.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/tasks` | List owned tasks; supports `search`, `status`, `priority`, and `projectId` |
| `GET` | `/api/tasks/{taskId}` | Get one owned task |
| `POST` | `/api/tasks` | Create a task |
| `PUT` | `/api/tasks/{taskId}` | Replace editable task fields |
| `PATCH` | `/api/tasks/{taskId}/status` | Update task status |
| `DELETE` | `/api/tasks/{taskId}` | Delete a task |

Task create/update body:

```json
{
  "projectId": "00000000-0000-4000-8000-000000000000",
  "name": "Prepare wireframes",
  "description": "Review mobile and desktop flows",
  "priority": "High",
  "status": "Pending",
  "dueDate": "2026-10-12"
}
```

Allowed statuses: `Pending`, `In Progress`, `Completed`. Allowed priorities: `Low`, `Medium`, `High`. `dueDate` can be omitted or `null`.

## Dashboard

`GET /api/dashboard` (protected) returns the authenticated user's `totalProjects`, `totalTasks`, `completedTasks`, `pendingTasks`, and `projectsInProgress` counts.

## Status codes and validation

- `400`: invalid input, enum, date, or UUID
- `401`: absent, invalid, or expired bearer token
- `404`: record not found or not visible to the authenticated user
- `429`: authentication rate limit reached
- `500`: unexpected API/database error

Input is validated in the API. Database access uses the caller's Supabase access token and the existing RLS policies. Do not rely on a client-supplied owner id; the server ignores it.

## Android local development

- Android emulator: set the app's API base URL to `http://10.0.2.2:4000` (the emulator's host-machine alias), not `localhost`.
- Physical Android device: use the computer's reachable LAN IP, for example `http://192.168.1.20:4000`, and allow the API port through the local firewall; both devices must share a network.
- Deployed build: use the HTTPS API origin.
- A simple connectivity check is `GET {API_BASE_URL}/health`.
- Native fetch is not blocked by browser CORS. Keep `CORS_ORIGINS` restricted to the web origin(s).
