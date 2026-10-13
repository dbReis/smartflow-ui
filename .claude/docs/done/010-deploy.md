# 010 – Deploy

**Status:** done (2026-10-13)

## Why

Reviewers should open a link, not clone a repo. CI also proves every change passes the same checks.

## Scope

**In:** a GitHub Actions workflow: checks on every push and pull request; on `main`, build and deploy to GitHub Pages. **Out:** hosting the API, and adding CORS to it (API repo).

## Acceptance criteria

- **AC-1** On every push and pull request, CI runs `npm ci`, `gen:api:check`, `lint`, `typecheck`, `format:check`, `test` and `build`; any failure fails the run.
- **AC-2** On `main`, the built `dist/` is deployed to GitHub Pages at `https://dbreis.github.io/smartflow-ui/`.
- **AC-3** The production API address comes from the repository variable `VITE_API_URL`; if it is not set, the build fails with the message from spec 001 (no silent `undefined` URL).
- **AC-4** CI uses the Node version from `.nvmrc`.
- **AC-5** The README says how to deploy: enable Pages ("GitHub Actions" source), set `VITE_API_URL`, and that the API must allow this site's origin (CORS).

## Decisions and trade-offs

- **A repository variable, not a secret:** `VITE_*` values end up in the public bundle anyway.
- **One workflow, deploy job only on `main`:** pull requests get the checks without publishing.
- **Spec 001 AC-7 resolved:** a plain `npm run build` needs `VITE_API_URL`; CI provides it.

## Tasks

- [x] T1 Workflow, README section (AC-1..5)

## Changes after completion

- **2026-10-13:** CI failed on every push because `VITE_API_URL` was not set yet. The `check` job now builds with a placeholder address (it only proves the app builds); the `deploy` job, on `main` only, builds with `vars.VITE_API_URL` and still fails without it (AC-3 holds for production).
