# 005 – Feedback detail

**Status:** done (2026-10-13)

## Why

One page per feedback: the full note, its state, and the place for discussion (006) and PM actions (008, 009).

## Scope

**In:** route `/feedback/:id`; the feedback (stars, full note, status, category, id); back link; merged state; not-found and error states. **Out:** comments (006), PM controls (007–009).

## API used

| Method | Path | In API? |
|---|---|---|
| GET | `/api/feedback/{id}` → Feedback (merged ones too) | **Planned** |
| GET | `/api/category` | **Planned** |

## Acceptance criteria

- **AC-1** `/feedback/7` shows feedback 7: stars, full note (line breaks kept), status badge, category name, "#7", and a "Back to the board" link.
- **AC-2** A merged feedback shows "Merged into #N" linking to `/feedback/N`, its note muted, and no comment form or PM controls.
- **AC-3** A 404 shows "Feedback #7 not found" with a link to the board; an id that is not a number shows the same without calling the API.
- **AC-4** Loading shows a skeleton; other errors show `QueryError` with "Try again".

## Decisions and trade-offs

- **The merged source stays viewable** (old links keep working) but points clearly at the target, instead of redirecting silently.

## Tasks

- [x] T1 Detail page, route, states, tests (AC-1..4)
