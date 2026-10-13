# 003 – Board

**Status:** done (2026-10-13)

## Why

The board is the home screen: everything people said, at a glance, and the entry point to every feedback.

## Scope

**In**

- `openapi.planned.json`: the endpoints the UI needs that the API does not have yet, in OpenAPI form, merged into the snapshot before types are generated. Merging fails when the API already defines one of them, so the file only ever holds what is still missing. It doubles as the contract for the API work.
- Board at `/`: feedback cards, newest first: rating stars, note (or "No note"), status badge, category chip, comment count; each card links to `/feedback/:id`.
- Loading, empty and error states.

**Out**

- New feedback form (004), detail page (005), PM controls (007–009).

## API used

| Method | Path | In API? |
|---|---|---|
| GET | `/api/feedback` → `FeedbackListItem[]` (active only: `merged_into_id` null), each with `comment_count` | **Planned** |
| GET | `/api/category` → `CategoryOut[]`, public (names on the chips are not secret) | **Planned** |

## Acceptance criteria

- **AC-1** `npm run gen:api` merges `openapi.planned.json` into `openapi.json`; if a planned path+method or schema already exists in `openapi.json`, it fails and names it.
- **AC-2** Given feedback exists, the board shows one card per feedback, newest (highest id) first, with stars (accessible label "Rated N out of 5"), note, status badge, category name and comment count.
- **AC-3** A card links to `/feedback/:id`.
- **AC-4** Given no feedback, a friendly empty state invites posting the first one.
- **AC-5** While loading, a skeleton shows; on error, `ErrorMessage` shows with a "Try again" button that refetches.
- **AC-6** If categories fail to load, cards still render, without category names.

## Decisions and trade-offs

- **Order by id, not date:** `FeedbackOut` has no timestamp; ids grow with time. With more time: `created_at` in the API.
- **Categories fetched separately** and joined in the UI, rather than embedding names in each feedback: one small cached list, reused by the PM picker.
- **`openapi.planned.json` holds every planned endpoint at once** (also those of 005–007), so the backend has one contract to implement.
- **`FeedbackListItem` has no `merged_into_id`:** the list is active feedback only, and `openapi-fetch` drops null-only properties from response types anyway.
- **No pagination:** fine for an MVP; with more time, `?limit`/cursor on the API.

## Tasks

- [x] T1 `openapi.planned.json` + merge script + `gen:api` update (AC-1)
- [x] T2 Query hooks, display components (stars, status badge, category chip)
- [x] T3 Board page with states, tests (AC-2..6)

## Changes after completion

- **2026-10-13:** the API implemented `GET /api/feedback` as `{"items": [FeedbackSummaryOut]}` instead of the planned bare array (room for pagination fields). The UI follows the API: snapshot refreshed, planned entries for `GET /api/feedback` and `GET /api/feedback/{id}` removed, board reads `items`.
