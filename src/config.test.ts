import { describe, expect, it } from 'vitest'
import { resolveApiBaseUrl } from './config'

const ORIGIN = 'http://localhost:5173'

describe('resolveApiBaseUrl', () => {
  it('AC-4: fails fast when VITE_API_URL is missing', () => {
    expect(() => resolveApiBaseUrl({ DEV: false }, ORIGIN)).toThrow(
      /VITE_API_URL/,
    )
    expect(() =>
      resolveApiBaseUrl({ DEV: false, VITE_API_URL: ' ' }, ORIGIN),
    ).toThrow(/VITE_API_URL/)
  })

  it('uses the API URL in production, without a trailing slash', () => {
    expect(
      resolveApiBaseUrl(
        { DEV: false, VITE_API_URL: 'https://api.example/' },
        ORIGIN,
      ),
    ).toBe('https://api.example')
  })

  it('uses the page origin in development, for the Vite proxy', () => {
    expect(
      resolveApiBaseUrl(
        { DEV: true, VITE_API_URL: 'http://localhost:8888' },
        ORIGIN,
      ),
    ).toBe(ORIGIN)
  })
})
