# 007 – PM mode

**Status:** done (2026-10-13)

## Why

Product Managers triage feedback. There are no accounts: the PM key is a shared secret, so "PM mode" means "this tab holds a valid key".

## Scope

**In:** a header toggle; a small key form; checking the key with the API before entering; leaving PM mode; leaving it automatically when the API rejects the key. **Out:** the PM controls themselves (008, 009).

## API used

| Method | Path | In API? |
|---|---|---|
| GET | `/api/pm/session` (Bearer key) → 204 / 401 / 503 | **Planned** |

## Acceptance criteria

- **AC-1** The header shows "PM mode"; clicking it reveals a password field ("PM key") with "Enter" and "Cancel".
- **AC-2** "Enter" checks the key with `GET /api/pm/session`; on 204 the header shows a "PM" badge and an "Exit PM mode" button, and the key is in `sessionStorage`.
- **AC-3** On 401 or 503 the API's message shows, the key is not kept, and PM mode stays off.
- **AC-4** "Exit PM mode" removes the key and hides PM controls.
- **AC-5** When any PM request gets a 401 later, PM mode turns off and the header says "Your PM key was rejected. Enter it again."
- **AC-6** Reloading the tab keeps PM mode (the key is still in `sessionStorage`); a new tab starts without it.

## Decisions and trade-offs

- **A small store outside React** (`useSyncExternalStore`) holds PM state, so the query client's global mutation error handler can turn PM mode off on 401 without wiring every form.
- **Inline form, not a modal dialog:** less code and no focus-trap work; fine for one field.
- **Hiding PM controls is convenience only;** the API enforces access (CLAUDE.md).

## Tasks

- [x] T1 PM store, header toggle and key form, 401 handling, tests (AC-1..6)
