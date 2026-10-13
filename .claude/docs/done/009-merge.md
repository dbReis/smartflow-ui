# 009 – PM: merge

**Status:** done (2026-10-13)

## Why

Duplicates split the discussion; merging gathers comments in one place.

## Scope

**In:** in the PM panel: "Merge into…" a choice of other active feedback, a confirmation step, then going to the target. **Out:** undoing a merge (not in the API).

## API used

| Method | Path | In API? |
|---|---|---|
| POST | `/api/feedback/{id}/merge` `{target_id}` → target Feedback | Yes (PM) |
| GET | `/api/feedback` (choices) | **Planned** |

## Acceptance criteria

- **AC-1** The merge choice lists other active feedback ("#id – note", note cut short), never the feedback itself.
- **AC-2** "Merge" asks for confirmation: "Merge #7 into #2? Its comments move to #2 and #7 becomes read-only." with "Confirm merge" and "Cancel".
- **AC-3** On success, the app navigates to the target, and the board, both feedback and their comments refetch.
- **AC-4** Errors (404, 409, 422) show the API's message; nothing changes.

## Decisions and trade-offs

- **Confirmation step:** a merge cannot be undone.

## Tasks

- [x] T1 Merge control with confirmation, tests (AC-1..4)
