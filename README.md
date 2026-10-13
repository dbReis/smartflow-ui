# SmartFlow UI

Web front end for [SmartFlow](https://github.com/dbReis/SmartFlow), an API for rated user feedback. Built with Vite, React, TypeScript, Tailwind CSS, TanStack Query and React Router.

## Run locally

Requirements: Node 24 (`nvm use` reads `.nvmrc`) and the SmartFlow API running on `http://localhost:8888`.

```bash
npm ci
npm run dev
```

Open http://localhost:5173/smartflow-ui/. The header shows whether the API is reachable.

In development the Vite dev server forwards `/api` requests to `VITE_API_URL` (set in `.env.development`), so the API does not need CORS for local work. See `.env.example`.

## Scripts

| Script              | What it does                                                                                        |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| `npm run dev`       | Dev server with hot reload                                                                          |
| `npm run build`     | Type-check and build to `dist/` (needs `VITE_API_URL`, e.g. `VITE_API_URL=https://… npm run build`) |
| `npm run preview`   | Serve the built app (also needs `VITE_API_URL`)                                                     |
| `npm test`          | Run the tests once (`test:watch` to keep watching)                                                  |
| `npm run lint`      | Lint with oxlint                                                                                    |
| `npm run typecheck` | Type-check without building                                                                         |
| `npm run format`    | Format with Prettier (`format:check` to only check)                                                 |

## Deploy

Every push and pull request runs the checks in `.github/workflows/ci.yml`; pushes to `main` also deploy to GitHub Pages (https://dbreis.github.io/smartflow-ui/). One-time setup:

1. Repository **Settings → Pages → Source: GitHub Actions**.
2. Repository **Settings → Secrets and variables → Actions → Variables**: add `VITE_API_URL` with the hosted API's address. Without it the build fails on purpose.
3. The API must allow this site's origin (`https://dbreis.github.io`) with CORS; the dev proxy only covers local development.

## Render (static site)

**New → Static Site**, this repository:

| Setting           | Value                                                           |
| ----------------- | --------------------------------------------------------------- |
| Build command     | `npm ci && npm run build`                                       |
| Publish directory | `dist`                                                          |
| `BASE_PATH`       | `/` (served at the root, not `/smartflow-ui/`)                  |
| `VITE_API_URL`    | the API's public URL, e.g. `https://smartflow-api.onrender.com` |

The browser calls the API directly, so the API must allow the site's origin with CORS. `VITE_API_URL` is read at build time: changing it needs a redeploy.

## API contract

`openapi.json` is a copy of the API's spec (`python -m smartflow.openapi <dir>` in the API repo). `openapi.planned.json` lists endpoints the UI needs that the API does not have yet; `npm run gen:api` merges both into `src/api/schema.d.ts`, and fails once the API provides a planned endpoint, so it can be removed from the planned file.

## Specs

Features are built from specs in `.claude/docs/specs/`; each acceptance criterion maps to a test or a manual check.
