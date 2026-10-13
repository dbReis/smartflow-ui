import { useSyncExternalStore } from 'react'
import { call, pmApi } from '../api/client'
import { ApiError } from '../api/errors'
import { clearPmKey, getPmKey, setPmKey } from '../api/pmKey'

// PM mode = this tab holds a PM key the API accepted. Kept outside React so
// the query client's global error handlers can leave PM mode on a 401.
interface PmState {
  active: boolean
  notice: string | null
}

let state: PmState = { active: getPmKey() !== null, notice: null }
const listeners = new Set<() => void>()

function setState(next: PmState) {
  state = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const pmMode = {
  /** Checks the key with the API; keeps it only if accepted. */
  async enter(key: string): Promise<void> {
    if (!setPmKey(key)) {
      throw new ApiError(
        0,
        'This browser blocks session storage, which PM mode needs.',
      )
    }
    try {
      await call(pmApi.GET('/api/pm/session'))
    } catch (error) {
      clearPmKey()
      throw error
    }
    setState({ active: true, notice: null })
  },

  exit(): void {
    clearPmKey()
    setState({ active: false, notice: null })
  },

  /** Called on any 401 while in PM mode. */
  handleError(error: unknown): void {
    if (state.active && error instanceof ApiError && error.status === 401) {
      clearPmKey()
      setState({
        active: false,
        notice: 'Your PM key was rejected. Enter it again.',
      })
    }
  },
}

export function usePmMode(): PmState {
  return useSyncExternalStore(subscribe, () => state)
}
