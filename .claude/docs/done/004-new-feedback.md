# 004 – New feedback

**Status:** done (2026-10-13)

## Why

Posting feedback is the core user action; it must be quick and obvious.

## Scope

**In:** a "New feedback" form at the top of the board: 5-star picker (required), optional note, submit. **Out:** editing or deleting feedback (not in the API).

## API used

| Method | Path | In API? |
|---|---|---|
| POST | `/api/feedback` `{rating, note?}` → 201 Feedback | Yes |

## Acceptance criteria

- **AC-1** The star picker is a radio group ("1 star" … "5 stars"), usable with keyboard and screen readers.
- **AC-2** Submitting without a rating shows "Choose a rating." and sends nothing.
- **AC-3** On submit, sends `{rating}` plus `note` only when the trimmed note is not empty; the button shows "Sending…" and is disabled meanwhile.
- **AC-4** On success, the form resets, a "Thanks for your feedback!" message appears, and the board refetches so the new card shows.
- **AC-5** On API error (e.g. 422), the API's message shows and the input is kept.
- **AC-6** The note is limited to 20 000 characters, as in the API.

## Decisions and trade-offs

- **Validation message instead of a disabled submit button:** a disabled button does not say why.
- **Refetch instead of inserting the new card by hand:** one extra request, but the list always matches the server.

## Tasks

- [x] T1 Star picker, form, mutation, tests (AC-1..6)
