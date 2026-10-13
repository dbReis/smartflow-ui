import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearPmKey, getPmKey, setPmKey } from './pmKey'

describe('PM key store', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    clearPmKey()
  })

  it('AC-9: stores the key in sessionStorage only', () => {
    expect(setPmKey('s3cret')).toBe(true)
    expect(getPmKey()).toBe('s3cret')
    expect(Object.values({ ...sessionStorage })).toContain('s3cret')
    expect(Object.values({ ...localStorage })).not.toContain('s3cret')
    expect(window.location.href).not.toContain('s3cret')
  })

  it('clears the key', () => {
    setPmKey('s3cret')
    clearPmKey()
    expect(getPmKey()).toBeNull()
  })

  it('AC-9: fails gracefully when sessionStorage is unavailable', () => {
    const blocked = () => {
      throw new DOMException('Blocked', 'SecurityError')
    }
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(blocked)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(blocked)
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(blocked)
    expect(setPmKey('s3cret')).toBe(false)
    expect(getPmKey()).toBeNull()
    expect(() => clearPmKey()).not.toThrow()
  })
})
