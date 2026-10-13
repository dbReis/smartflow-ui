// The PM key is a shared secret: kept in sessionStorage only (gone when the
// tab closes), never in localStorage, the URL or logs. Storage access can
// throw (private mode, blocked storage), so every call is guarded.
const STORAGE_KEY = 'smartflow.pmKey'

export function getPmKey(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

/** Returns false when the key could not be stored. */
export function setPmKey(key: string): boolean {
  try {
    sessionStorage.setItem(STORAGE_KEY, key)
    return true
  } catch {
    return false
  }
}

export function clearPmKey(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing stored, nothing to clear.
  }
}
