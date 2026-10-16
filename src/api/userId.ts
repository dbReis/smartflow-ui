// Anonymous id of this browser, sent as X-User-Id when voting so the API keeps
// one notation per user and comment (spec 012). It identifies, it does not
// authenticate: there are no accounts, and any client can send any id. Kept in
// localStorage so it survives reloads and is shared by all tabs.
const STORAGE_KEY = 'smartflow.userId'

// Used when the id cannot be stored (private mode, blocked storage): votes
// still work for as long as the page stays open.
let fallbackId: string | undefined

function newId(): string {
  // randomUUID needs a secure context (HTTPS or localhost); getRandomValues
  // also works on plain HTTP, e.g. a LAN address.
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  )
}

export function getUserId(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return stored
    }
    const id = newId()
    localStorage.setItem(STORAGE_KEY, id)
    return id
  } catch {
    fallbackId ??= newId()
    return fallbackId
  }
}
