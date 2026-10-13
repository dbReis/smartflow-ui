# 011 – Render static site

**Status:** done (2026-10-13)

## Why

Run the UI on Render next to the Tornado API.

## History

A first version used a Docker image (nginx serving the files and proxying `/api` to the API, so no CORS). The developer chose the simpler route: a Render Static Site, with CORS added to the API (needed for GitHub Pages anyway). The Docker files were removed.

## Scope

**In:** a `BASE_PATH` build variable so the app can be served at `/`; README steps for a Render Static Site. **Out:** CORS in the API (API repo).

## Acceptance criteria

- **AC-1** `BASE_PATH=/ VITE_API_URL=https://… npm run build` produces a `dist/` whose assets load from `/`.
- **AC-2** Without `BASE_PATH`, the build is unchanged for GitHub Pages (`/smartflow-ui/`).
- **AC-3** The README lists the Render settings (build command, publish directory, `BASE_PATH`, `VITE_API_URL`) and the CORS requirement.

## Decisions and trade-offs

- **Static site + CORS over Docker + nginx proxy:** no extra files in the UI repo, CDN hosting that does not sleep on the free plan. Cost: the API needs CORS, and changing the API address needs a rebuild.

## Tasks

- [x] T1 `BASE_PATH` build variable, README (AC-1..3)
