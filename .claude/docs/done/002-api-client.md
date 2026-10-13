# 002 – API client

**Status:** done (2026-10-13)

## Why

Every screen talks to the API. One typed client, one error type and one place that adds the PM key mean screens never deal with `fetch`, status codes or headers themselves, and every failure reaches the user as a readable message. Types come from the API's OpenAPI spec, so a contract change shows up as a type error instead of a runtime bug.

## Scope

**In**

- A committed snapshot of the API's OpenAPI spec (`openapi.json` in the repo root) and an `npm run gen:api` script that generates `src/api/schema.d.ts` with `openapi-typescript`
- A check that the generated file is up to date (`npm run gen:api -- --check` style, used later in CI)
- A typed client (`openapi-fetch`) with the base URL from `src/config.ts`
- `ApiError`: one error type for every failure, with `status` and a user-readable `message`
- PM key storage in `sessionStorage` (get / set / clear) and a separate `pmApi` client that sends `Authorization: Bearer <key>`
- TanStack Query defaults: retry only when retrying can help
- A small `ErrorMessage` component that shows any error the same way
- Move the health check from spec 001 onto the new client

**Out**

- Real screens and their queries (003–009)
- Entering / leaving PM mode, the key prompt and `GET /api/pm/session` (007)
- Adding the missing endpoints or CORS to the API (API repo)

## API used

| What | Exists? |
|---|---|
| Error shape `{"error": {"code", "message"}}` (`ErrorOut`) | Yes, in the OpenAPI spec |
| `GET /api/health`, `POST /api/feedback`, `POST …/comments`, `POST …/notation` | Yes, in the OpenAPI spec |
| PM endpoints (`status`, `category`, `merge`, `POST /api/category`), `CategoryOut`, `pmKey` bearer security scheme | Yes, in the OpenAPI spec (snapshot added 2026-10-13) |
| `GET` list/detail endpoints, `GET /api/pm/session` | Not yet in the API |

**Weak types in the snapshot:** `FeedbackOut.status` is a plain `string` and `FeedbackOut.rating` a plain `integer`, although the spec defines `FeedbackStatus` and `RatingValue` enums. The generated types inherit this. Fix belongs in the API (use the enums in `FeedbackOut`); until then the UI narrows them in one place.

## Acceptance criteria

- **AC-1** Given `openapi.json`, when I run `npm run gen:api`, then `src/api/schema.d.ts` is regenerated, and running it again produces no diff.
- **AC-2** Given the generated file is out of date with the snapshot, when I run `npm run gen:api:check`, then it exits non-zero with a message saying to run `gen:api`.
- **AC-3** Given a call with a wrong path, a missing required body field or a wrong field type, then `npm run typecheck` fails.
- **AC-4** Given the API answers with the error shape (e.g. 422), then the call rejects with an `ApiError` whose `status` is 422 and whose `message` is the API's `message`, unchanged.
- **AC-5** Given the API answers an error status without the error shape (e.g. a 502 HTML page from a proxy), then `ApiError.message` is a generic readable message for that status, never raw HTML or `undefined`.
- **AC-6** Given the network fails (API down, CORS refusal), then the call rejects with an `ApiError` with `status` 0 and the message "Cannot reach the API."
- **AC-7** Given a PM key is stored, when a request goes through `pmApi`, then it carries `Authorization: Bearer <key>`; requests through `api` never carry it.
- **AC-8** Given no PM key is stored, when a `pmApi` request is made, then it is not sent and rejects with an `ApiError` (status 401, "Enter the PM key first.").
- **AC-9** The PM key is stored only in `sessionStorage`; it never appears in `localStorage`, the URL, error messages or console output. If `sessionStorage` is unavailable, PM key functions fail gracefully (no crash).
- **AC-10** Queries are not retried on 4xx; network errors and 5xx are retried once.
- **AC-11** `ErrorMessage` renders `ApiError.message` (or a generic fallback for other errors) in an alert region screen readers announce.
- **AC-12** The header health indicator still behaves as in spec 001, now using the shared client.

## UI states

| State | What the user sees |
|---|---|
| Error | `ErrorMessage`: red-tinted box with the message, `role="alert"` |
| Others | n/a in this spec (no screens yet) |

## Decisions and trade-offs

- **Committed OpenAPI snapshot** over fetching `/openapi.json` at build time: builds and CI do not need a running API, and contract changes show up as a reviewable diff. Cost: the snapshot must be refreshed by hand when the API changes; the `gen:api:check` script catches a stale generated file, not a stale snapshot. With more time: the API's CI publishes `openapi.json` and the UI's CI compares against it.
- **`openapi-fetch`** (~6 kB, same author as `openapi-typescript`) over a hand-written `fetch` wrapper: typed paths, params and bodies for free. Our own code stays in the error layer, which is the part worth defending.
- **Two clients, `api` and `pmApi`,** over sending the key on every request or keeping a list of PM paths: which requests carry the key is visible at each call site, and the key never goes to public endpoints.
- **`ApiError` for everything,** including network failures (status 0): screens handle one error type.
- **The API's `message` is shown as is,** because `CLAUDE.md` says it is written to be readable. Generic messages are only a fallback.
- **`openapi-typescript` runs with `--default-non-nullable false`:** by default it treats every field with a default value as always present, which made the optional `note` *required* in request bodies. Found by the AC-3 checks; valid calls are now part of them.
- **npm `overrides` lets `openapi-typescript` 7 use TypeScript 6:** it declares a TypeScript 5 peer only. Its output with TypeScript 6 was compared byte for byte with the TypeScript 5 output: identical. Remove the override once a release supports TypeScript 6.
- **In development the base URL is the page's own origin** (spec 001 used `''`): same proxy path, but an absolute URL, which `Request` requires outside the browser.
- **No automatic reaction to 401 here:** clearing the key and leaving PM mode belongs to spec 007, which can read `ApiError.status`.

## Resolved questions

1. **Getting the snapshot:** the developer exported `openapi.json` from the API and added it to the repo root. No Python needed in this repo.
2. **PM endpoints in the API spec:** already described in the snapshot.

## Open questions

1. **Status/rating enums:** fix `FeedbackOut` in the API so the snapshot carries the `FeedbackStatus` and `RatingValue` enums? Recommendation: yes (small API change); meanwhile the UI narrows the types in `src/api/types.ts`. Developer will fix it in the API later.

## Tasks

- [x] T1 `openapi-typescript` + `gen:api` / `gen:api:check` scripts, generated `src/api/schema.d.ts` (AC-1, AC-2)
- [x] T2 `ApiError` and response → error mapping, with tests (AC-4, AC-5, AC-6)
- [x] T3 `api` / `pmApi` clients (`openapi-fetch`), PM key store, with tests (AC-3, AC-7, AC-8, AC-9)
- [x] T4 Query retry rules and `ErrorMessage`, with tests (AC-10, AC-11)
- [x] T5 Health check on the shared client (AC-12)

## What I'd do with more time

- Publish `openapi.json` from the API's CI and check the UI against it automatically
- Contract tests: run the UI's client against the real API in CI
- Request cancellation and timeouts (`AbortSignal.timeout`) on slow requests
