# Console — Next.js App Router Starter

A Next.js (App Router) starter wired up to talk to a Node.js backend, with:

- **Login page** (`/login`) — Tailwind CSS v4 styled, split layout with an animated
  "connecting to backend" terminal panel as the visual signature.
- **Dashboard page** (`/dashboard`) — a welcome screen, rendered as a server
  component that verifies the session against your backend on every load.
- **Middleware** (`middleware.ts`) — guards `/dashboard` (redirects to `/login`
  if there's no session) and keeps signed-in users out of `/login`.
- **Service layer** (`lib/api.ts` + `lib/auth-service.ts`) — a single place
  that knows how to talk to your Node backend (base URL, headers, error
  shape, auth token).

## How auth flows

1. The login form posts to `/api/auth/login` (a Next.js Route Handler, not
   the Node backend directly).
2. That route calls your Node backend's `/auth/login` via `authService`,
   gets back `{ token, user }`, and sets `token` as an **httpOnly** cookie
   named `session_token`. httpOnly means client-side JS can never read it,
   which keeps the token safe from XSS.
3. `middleware.ts` checks for that cookie on every request to decide
   whether to allow or redirect.
4. `/dashboard` is a server component — it reads the cookie with
   `cookies()`, sends the token to your backend's `/auth/me`, and renders
   the returned user. If the backend rejects the token, it's treated as
   signed out.
5. Signing out posts to `/api/auth/logout`, which deletes the cookie.

## Connecting your Node backend

1. Copy `.env.local.example` to `.env.local` and point it at your API:

   ```
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
   ```

2. Make sure your backend exposes (or adjust the paths in
   `lib/auth-service.ts` to match what you already have):
   - `POST /auth/login` → `{ token, user }`
   - `GET /auth/me` (Bearer token) → the current user

## Running locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` — it redirects to `/login`.

## Notes

- Fonts are loaded via `next/font/google` (Inter, Space Grotesk, JetBrains
  Mono) in `app/layout.tsx`. This requires outbound access to
  `fonts.googleapis.com` at build time. If your build environment has
  restricted network egress, swap these for self-hosted font files or a
  system font stack.
- All colors, spacing, and fonts are defined as design tokens in
  `app/globals.css` under `@theme` (Tailwind v4's CSS-first config) —
  change them there to re-theme the whole app.
