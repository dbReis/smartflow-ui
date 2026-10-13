import { describe, expect, it } from 'vitest'
import { ApiError } from './errors'
import { shouldRetry } from './queryClient'

describe('shouldRetry', () => {
  it.each([400, 401, 404, 409, 422])(
    'AC-10: never retries HTTP %i',
    (status) => {
      expect(shouldRetry(0, new ApiError(status, 'x'))).toBe(false)
    },
  )

  it.each([0, 500, 502, 503])('AC-10: retries status %i once', (status) => {
    expect(shouldRetry(0, new ApiError(status, 'x'))).toBe(true)
    expect(shouldRetry(1, new ApiError(status, 'x'))).toBe(false)
  })

  it('does not retry programming errors', () => {
    expect(shouldRetry(0, new TypeError('x is undefined'))).toBe(false)
  })
})
