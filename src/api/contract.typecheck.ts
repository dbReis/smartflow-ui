// AC-3: the API contract is enforced by the type checker. Valid calls must
// compile; each @ts-expect-error line must be a type error, or
// `npm run typecheck` fails on the unused directive. Never executed.
import { api, pmApi } from './client'

export function contractChecks() {
  // Valid: optional fields may be left out.
  void api.POST('/api/feedback', { body: { rating: 5 } })
  void pmApi.POST('/api/category', { body: { name: 'UX' } })

  // @ts-expect-error unknown path
  void api.GET('/api/nope')
  // @ts-expect-error missing required body field `rating`
  void api.POST('/api/feedback', { body: { note: 'x' } })
  // @ts-expect-error rating must be 1..5
  void api.POST('/api/feedback', { body: { rating: 6 } })
  void pmApi.PUT('/api/feedback/{feedback_id}/status', {
    params: { path: { feedback_id: 1 } },
    // @ts-expect-error not a feedback status
    body: { status: 'done' },
  })
}
