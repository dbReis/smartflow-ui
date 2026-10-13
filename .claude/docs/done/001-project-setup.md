# 001 – Project setup

**Status:** done (2026-10-13)

## Why

Every screen depends on the same foundation: the build tool, styling, routing, server-data handling and the API address. Setting it up once, with a visible proof that the UI can reach the API, means later specs only add features.

## Scope

**In**

- Vite + React + TypeScript (strict mode) project in the repo root
- Tailwind CSS, with Inter or the system UI font and a neutral palette with one accent colour
- React Router with hash routing; Vite `base: "/smartflow-ui/"`
- TanStack Query provider
- `VITE_API_URL` read from env files, with a typed, single place that exposes it
- An app shell (header with "SmartFlow" title, main area) and a placeholder home route
- A small API status indicator that calls `GET /api/health`
- Vitest + React Testing Library, so acceptance criteria can be tested
- `npm` scripts: `dev`, `build`, `preview`, `lint`, `format`, `test`, `typecheck`
- Vite dev-server proxy: `/api` → `VITE_API_URL`
- Pinned Node version (`.nvmrc`) and README "Run locally" section

**Out** (other specs)

- Generated API types and the shared API client (002)
- Real screens: board, detail, PM mode (003–009)
- GitHub Actions and Pages deployment (010)

## API used

| Method | Path | Exists in API? |
|---|---|---|
| GET | `/api/health` → 200 `{"status": "ok"}` | Yes |

The API sends no CORS headers yet (checked `handlers/base.py`). In development the Vite dev server proxies `/api` to `VITE_API_URL`, so the browser only talks to its own origin (see decisions). Production still needs CORS on the API.

## Acceptance criteria

- **AC-1** Given a fresh clone with the pinned Node version, when I run `npm ci && npm run dev`, then the app opens at `http://localhost:5173/smartflow-ui/` with no console errors.
- **AC-2** Given the app is running, when I open `/#/`, then I see the app shell (header with "SmartFlow") and the home placeholder.
- **AC-3** Given an unknown hash route such as `/#/nope`, then a friendly "Page not found" view with a link home is shown.
- **AC-4** Given `VITE_API_URL` is not set at build time, then the app fails fast with a clear message instead of calling `undefined/api/health`.
- **AC-5** Given the API is running and reachable, when the app loads, then the header shows "API online".
- **AC-6** Given the API is down or unreachable, when the app loads, then the header shows "API offline" with a readable reason; the rest of the app still renders.
- **AC-7** `npm run build`, `npm run lint`, `npm run typecheck`, `npx prettier --check .` and `npm test` all pass with no errors or warnings.
- **AC-8** Given `npm run build && npm run preview`, then the built app loads correctly under the `/smartflow-ui/` base path (assets resolve, routing works).

## UI states

| State | What the user sees |
|---|---|
| Loading | Header indicator shows a neutral "Checking API…" |
| Success | Green dot + "API online" |
| Error | Red dot + "API offline", reason in a tooltip/title |
| Empty | n/a |

## Decisions and trade-offs

- **Hash routing** over browser routing: GitHub Pages has no SPA fallback. Cost: less pretty URLs. With more time: a `404.html` redirect trick or a host with rewrites.
- **Env access in one module** (`src/config.ts`): one place to validate and type `VITE_API_URL`, instead of `import.meta.env` scattered everywhere.
- **Health indicator in the header**: smallest real end-to-end check; it also exercises TanStack Query's loading/error states before the real screens exist.
- **Vitest** over Jest: same config as Vite, no extra transform setup.
- **`.env.development` committed, `.env.production` holds only the public API URL**: `VITE_*` values end up in the bundle anyway, so nothing secret may go there.

## Resolved questions

1. **CORS → Vite dev proxy for now.** In development the app calls relative `/api/...` URLs and the Vite dev server forwards them to `VITE_API_URL`. In production the app calls `VITE_API_URL` directly, which needs CORS on the API (still on the API's to-do list). Trade-off: dev and prod take slightly different network paths.
2. **Node:** Node 24 LTS via `nvm`, pinned in `.nvmrc`.
3. **Formatter:** Prettier, plus a `format` script; the linter (oxlint, the Vite template default) does not check formatting.

## Tasks

- [x] T1 Node 24 via nvm, `.nvmrc`, Vite react-ts scaffold, demo content removed (AC-1)
- [x] T2 `base: "/smartflow-ui/"`, strict TS, `typecheck` script, dev proxy (AC-8)
- [x] T3 Tailwind, font, colour tokens
- [x] T4 `src/config.ts` + `.env.development` / `.env.example` (AC-4)
- [x] T5 Router: shell, home placeholder, not-found view (AC-2, AC-3)
- [x] T6 TanStack Query + health indicator (AC-5, AC-6)
- [x] T7 Vitest + Testing Library tests, Prettier (AC-7)
- [x] T8 README "Run locally"

## What I'd do with more time

- Pre-commit hook (lint + typecheck) with `lint-staged`
- Bundle-size budget check in CI
- Playwright smoke test against the built app
