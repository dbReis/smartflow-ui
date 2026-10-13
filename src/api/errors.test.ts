import { describe, expect, it } from 'vitest'
import { ApiError, toApiError } from './errors'

describe('toApiError', () => {
  it("AC-4: keeps the API's message and status", () => {
    const error = toApiError(422, {
      error: { code: 422, message: 'rating: Input should be 1, 2, 3, 4 or 5' },
    })
    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(422)
    expect(error.message).toBe('rating: Input should be 1, 2, 3, 4 or 5')
  })

  it.each([
    [502, '<html><body>Bad Gateway</body></html>'],
    [500, undefined],
    [404, { detail: 'other shape' }],
    [422, { error: { code: 422, message: '' } }],
    [418, null],
  ])(
    'AC-5: uses a readable message for HTTP %i without the error shape',
    (status, body) => {
      const error = toApiError(status, body)
      expect(error.status).toBe(status)
      expect(error.message).not.toMatch(/<|undefined|null/)
      expect(error.message.length).toBeGreaterThan(0)
    },
  )

  it('AC-5: says the API is unavailable for a proxy 502', () => {
    expect(toApiError(502, 'Bad Gateway').message).toBe(
      'The API is unavailable right now. Try again later.',
    )
  })
})
