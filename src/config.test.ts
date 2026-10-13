import { describe, expect, it } from 'vitest'
import { resolveApiBaseUrl } from './config'

describe('resolveApiBaseUrl', () => {
  it('AC-4: fails fast when VITE_API_URL is missing', () => {
    expect(() => resolveApiBaseUrl({ DEV: false })).toThrow(/VITE_API_URL/)
    expect(() => resolveApiBaseUrl({ DEV: false, VITE_API_URL: ' ' })).toThrow(
      /VITE_API_URL/,
    )
  })

  it('uses the API URL in production, without a trailing slash', () => {
    expect(
      resolveApiBaseUrl({ DEV: false, VITE_API_URL: 'https://api.example/' }),
    ).toBe('https://api.example')
  })

  it('uses relative URLs in development, for the Vite proxy', () => {
    expect(
      resolveApiBaseUrl({ DEV: true, VITE_API_URL: 'http://localhost:8888' }),
    ).toBe('')
  })
})
