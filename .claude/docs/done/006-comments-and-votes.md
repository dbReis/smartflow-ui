# 006 – Comments and votes

**Status:** done (2026-10-13)

## Why

Discussion is what turns a rating into something actionable; votes bring the most useful comments to the top.

## Scope

**In:** on the detail page: comments sorted by score (best first), ▲/▼ voting, an "Add a comment" form. **Out:** editing or deleting comments, a "0" notation button (the API accepts it, but it changes no score and only adds noise).

## API used

| Method | Path | In API? |
|---|---|---|
| GET | `/api/feedback/{id}/comments` → `CommentWithScore[]` | **Planned** |
| POST | `/api/feedback/{id}/comments` `{comment}` (1–2000 chars) | Yes |
| POST | `/api/comments/{id}/notation` `{notation: -1\|1}` | Yes |

## Acceptance criteria

- **AC-1** Comments show best score first (ties: oldest first), each with its text and score.
- **AC-2** No comments: "No comments yet. Start the discussion."
- **AC-3** ▲ sends `notation: 1`, ▼ sends `-1`; afterwards the comments refetch, the chosen arrow shows as pressed, and both arrows are disabled for that comment in this browser.
- **AC-4** The comment form requires 1–2000 characters after trimming ("Write a comment first." otherwise); on success it clears and the comments and the board's comment count refetch.
- **AC-5** API errors from voting or commenting show the API's message.
- **AC-6** Merged feedback (read-only, 409) shows its comments as moved: a short note pointing at the target instead of the list and form.

## Decisions and trade-offs

- **One vote per comment per browser, remembered in `localStorage`:** the API has no user accounts, so it cannot stop repeat votes; this is only a courtesy guard and is trivially bypassed. With more time: user identity in the API and one notation per user, which would also allow changing a vote.

## Tasks

- [x] T1 Comment list with votes, add-comment form, tests (AC-1..6)

## Changes after completion

- **2026-10-13:** the API implemented its list endpoints (`GET /api/feedback/{id}/comments`, `GET /api/category`) as `{"items": [...]}` instead of the planned bare arrays; comments also carry `votes` (number of notations). The UI follows the API; the planned entries were removed.
