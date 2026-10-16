import { afterEach, describe, expect, it, vi } from 'vitest'
import { getUserId } from './userId'

describe('User id (spec 012)', () => {
  afterEach(() => vi.restoreAllMocks())

  it('AC-1: creates an id once and reuses it from localStorage', () => {
    const id = getUserId()
    expect(id).toMatch(/^[0-9a-f-]{32,36}$/)
    expect(localStorage.getItem('smartflow.userId')).toBe(id)
    expect(getUserId()).toBe(id)
  })

  it('AC-1: keeps an existing id', () => {
    localStorage.setItem('smartflow.userId', 'abc')
    expect(getUserId()).toBe('abc')
  })

  it('creates an id without randomUUID (plain HTTP)', () => {
    // An own property hides the prototype's randomUUID; deleting it restores it.
    Object.defineProperty(crypto, 'randomUUID', {
      value: undefined,
      configurable: true,
    })
    try {
      expect(getUserId()).toMatch(/^[0-9a-f]{32}$/)
    } finally {
      delete (crypto as { randomUUID?: unknown }).randomUUID
    }
  })

  it('still gives a stable id when localStorage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const id = getUserId()
    expect(id).toBeTruthy()
    expect(getUserId()).toBe(id)
  })
})
