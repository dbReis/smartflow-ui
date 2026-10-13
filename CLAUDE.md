# SmartFlow UI

The web front end for **SmartFlow**, an API for rated user feedback: users post feedback (rating 1–5, optional note), discuss it in comments, and give comments a notation (−1, 0, +1); Product Managers categorise feedback, set its status and merge duplicates.

This repo contains **only the UI**. The API lives in a separate repository: https://github.com/dbReis/SmartFlow (Python, Tornado, PostgreSQL). Its `ARCHITECTURE.md` explains the design and assumptions; read it before changing how the UI talks to the API.

This is a job-interview assignment (SmartFlow, "Cloud Backend Developer"). Reviewers judge code quality, robustness, error handling, documentation and attention to detail. Keep the UI a small, polished MVP: simple, intuitive, minimalistic, clean.

## Stack (decided)

- **Vite + React + TypeScript**
- **Tailwind CSS** for styling
- **TanStack Query** for server data (loading, errors, caching, refetch after changes)
- **React Router** with **hash routing** (`/#/feedback/7`), because GitHub Pages cannot serve client-side routes
- Hosted on **GitHub Pages**, deployed by a GitHub Actions workflow; Vite `base` must be `"/<repo-name>/"`
- API address from **`VITE_API_URL`**: `http://localhost:8888` in development, the hosted API in production
- **API types are generated, not hand-written**: `openapi-typescript` reads the API's `/openapi.json`. The OpenAPI spec is the contract between the two repos.

## The API contract

Base URL: `VITE_API_URL`. All bodies are JSON. Interactive docs: `<API>/docs`; spec: `<API>/openapi.json`.

### Errors

Every error has the same shape. Show `message` to the user; it is written to be readable.

```json
{"error": {"code": 422, "message": "rating: Input should be 1, 2, 3, 4 or 5"}}
```

| Code | Meaning |
|---|---|
| 400 | Body is not valid JSON |
| 401 | PM endpoint without a valid PM key |
| 404 | Feedback / comment / category not found |
| 405 | Wrong HTTP method for this URL |
| 409 | The feedback was merged and is read-only |
| 422 | Invalid input; message is `field: problem`, several joined with `; ` |
| 503 | PM features are not configured on the server |

### Data shapes

```
Feedback  { id, rating: 1..5, note: string|null, status, category_id: number|null, merged_into_id: number|null }
Comment   { id, feedback_id, comment }
Notation  { id, comment_id, notation: -1|0|1 }
Category  { id, name, description: string|null }
status    "open" | "closed_backlog" | "closed_solved" | "closed_rejected"   (new feedback is "open")
```

### Endpoints that exist

| Method | Path | Body | Success | Who |
|---|---|---|---|---|
| GET | `/api/health` | — | 200 `{"status": "ok"}` | anyone |
| POST | `/api/feedback` | `{rating, note?}` | 201 Feedback | anyone |
| POST | `/api/feedback/{id}/comments` | `{comment}` (1–2000 chars) | 201 Comment | anyone |
| POST | `/api/comments/{id}/notation` | `{notation: -1\|0\|1}` | 201 Notation | anyone |
| PUT | `/api/feedback/{id}/status` | `{status}` | 200 Feedback | PM |
| PUT | `/api/feedback/{id}/category` | `{category_id}` (`null` removes it) | 200 Feedback | PM |
| POST | `/api/feedback/{id}/merge` | `{target_id}` | 200 target Feedback | PM |
| POST | `/api/category` | `{name, description?}` | 201 Category | PM |

**PM endpoints** need `Authorization: Bearer <PM key>`. There are no user accounts: the PM key is a shared secret. In the UI, "PM mode" asks for the key, keeps it in `sessionStorage` (never `localStorage`, never in the URL or logs), and sends it on PM requests. Hiding PM controls is only convenience; the API enforces access.

**Merge:** the source feedback's comments (and their notations) move to the target; the source stays, with `merged_into_id` set, and becomes read-only (409 on any change). Show merged feedback as "Merged into #N" with a link, not as a normal card.

### Endpoints still missing in the API (planned, needed by the UI)

Build the UI against these names; they are added to the API first.

- `GET /api/feedback`: active feedback (not merged), for the board
- `GET /api/feedback/{id}`: one feedback
- `GET /api/feedback/{id}/comments`: comments with their score (`SUM(notation)`), best first
- `GET /api/category`: categories, for the PM picker
- `GET /api/pm/session`: 204 if the PM key is valid; used when entering PM mode
- **CORS** on the API, allowing this site's origin and `http://localhost:5173`

Until they exist, check the API repo's `ARCHITECTURE.md` and `/openapi.json` for the real shapes rather than guessing.

Their exact proposed shapes are in `openapi.planned.json`; `npm run gen:api` merges it into the API's `openapi.json` and fails once the API provides one of them.

## Screens

1. **Board** (`/`): feedback cards (rating stars, note, status badge, category chip, comment count); "New feedback" form with a 5-star picker and an optional note; friendly empty state.
2. **Feedback detail** (`/feedback/:id`): the feedback, its comments sorted by score with ▲/▼ voting, an "add comment" box.
3. **PM mode** (a header toggle, not a page): status dropdown, category picker with "new category", "Merge into…" on the detail page.

Design: lots of white space, neutral greys with one accent colour, one clean font (Inter or system UI), soft cards, clear loading, error and empty states. Show API error messages in the UI; never fail silently.

## How the developer likes to work

- **Explain before and while doing.** Prefer guidance, pseudo-code and review; the developer usually writes the code themselves to be able to defend it in the interview. Implement directly only when explicitly asked, then explain every part.
- Work **step by step**, one small, reviewable change at a time.
- Small, focused commits with clear messages; **never commit or push unless asked**.
- Point out trade-offs and "what I'd do with more time" items; they are interview material.
