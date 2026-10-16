# 012 – Change your vote

**Status:** done (2026-10-16)

## Why

The API now identifies the voter with an `X-User-Id` header and keeps one notation per user and comment (`PUT /api/comments/{id}/notation`, answer 200). Voting again replaces the old value, so the UI can let users change or take back their vote instead of locking the arrows (spec 006).

## Scope

**In:** an anonymous user id for this browser, sent on votes; the new `PUT` endpoint; ▲/▼ that step the vote up and down. **Out:** showing the user's vote from the API (the comments list does not return it, see trade-offs); real accounts.

## Acceptance criteria

- **AC-1** On first use the app creates a random user id (UUID) and keeps it in `localStorage`; the same id is reused on later visits and in other tabs.
- **AC-2** Votes are sent as `PUT /api/comments/{id}/notation` with `X-User-Id: <user id>`; no other request sends the header.
- **AC-3** ▲ adds 1 and ▼ takes 1 away from the user's vote, within -1..1. Without a vote (same as 0), ▲ sends `1` and ▼ sends `-1`.
- **AC-4** At `1`, ▼ sends `0` and ▲ is disabled; at `-1`, ▲ sends `0` and ▼ is disabled.
- **AC-5** After a successful vote the comments refetch and the pressed arrow matches the value sent (none for `0`); the arrows are otherwise disabled only while that comment's vote is being sent.
- **AC-6** API errors from voting (e.g. 401, 404, 422) show the API's message, and the pressed arrow does not change.

## Decisions and trade-offs

- **Arrows step the vote by 1 (`+1 → 0 → -1`):** each click moves the score by exactly 1, and `0` is reached naturally, with no extra "neutral" button. The arrow at the end of the range is disabled, which also shows the current vote.
- **User id in `localStorage`, not `sessionStorage`:** one notation per user only means something if the id survives a reload. It is not a secret: it identifies, it does not authenticate (any client can send any id, see the API's ARCHITECTURE.md).
- **The user's own vote is remembered in the browser:** `GET /api/feedback/{id}/comments` returns the score but not "my notation", so the pressed arrow comes from `localStorage` next to the user id. Both are cleared together, so they stay consistent. With more time: the API returns `my_notation` per comment when `X-User-Id` is sent, and the browser stops keeping votes.
- **`crypto.randomUUID()`** needs a secure context (HTTPS or `localhost`); a fallback with `crypto.getRandomValues` covers plain-HTTP addresses such as a LAN IP.

## Tasks

- [x] T1 Refresh `openapi.json` from the API and regenerate `schema.d.ts`
- [x] T2 `userId.ts` (AC-1); `useVote` with `PUT` and the header (AC-2)
- [x] T3 Toggle logic in `votes.ts` and `Comments.tsx` (AC-3..6); tests

## Changes after completion

- **2026-10-16:** the refreshed `openapi.json` also brought `GET /api/pm/session` (same shape as planned, so `openapi.planned.json` is now empty) and enum types for `rating` and `status`, so `api/types.ts` no longer narrows them by hand (spec 002, open question 1).
- **2026-10-16:** the developer asked for ▼ to take 1 away rather than jump from `1` to `-1`. The arrows now step the vote (AC-3..5 rewritten); the first version made the pressed arrow undo the vote and the other one switch.
