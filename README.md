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

## Specs

Features are built from specs in `.claude/docs/specs/`; each acceptance criterion maps to a test or a manual check.
