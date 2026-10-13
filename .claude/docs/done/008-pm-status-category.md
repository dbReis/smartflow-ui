# 008 – PM: status and category

**Status:** done (2026-10-13)

## Why

Triage: PMs mark what happens with each feedback and group it by category.

## Scope

**In:** in PM mode, on an active (not merged) feedback's page: a status dropdown, a category dropdown with "No category" and "New category…" (name + optional description). **Out:** renaming or deleting categories (not in the API).

## API used

| Method | Path | In API? |
|---|---|---|
| PUT | `/api/feedback/{id}/status` `{status}` | Yes (PM) |
| PUT | `/api/feedback/{id}/category` `{category_id \| null}` | Yes (PM) |
| POST | `/api/category` `{name, description?}` | Yes (PM) |
| GET | `/api/category` | **Planned** |

## Acceptance criteria

- **AC-1** PM controls show only in PM mode and only on active feedback.
- **AC-2** Changing the status sends it at once; the page and the board refetch; the control is disabled while saving.
- **AC-3** Choosing a category or "No category" sends `category_id` (or `null`) the same way.
- **AC-4** "New category…" shows a name field (required) and description field; "Create" posts the category, then assigns it to the feedback; the categories list refetches.
- **AC-5** Errors show the API's message (e.g. 422 for an empty name); a 401 leaves PM mode (007).

## Decisions and trade-offs

- **Save on change, no "Save" button:** one field, one request, immediate feedback.

## Tasks

- [x] T1 PM panel with status and category controls, new category form, tests (AC-1..5)

## Changes after completion

- **2026-10-13:** the API implemented its list endpoints (`GET /api/feedback/{id}/comments`, `GET /api/category`) as `{"items": [...]}` instead of the planned bare arrays; comments also carry `votes` (number of notations). The UI follows the API; the planned entries were removed.
