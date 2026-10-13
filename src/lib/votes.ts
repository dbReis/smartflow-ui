// Remembers this browser's vote per comment. The API has no user accounts,
// so this is only a courtesy guard against accidental repeat votes (spec 006).
export type Vote = 1 | -1

const STORAGE_KEY = 'smartflow.votes'

function readAll(): Record<string, Vote> {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? '{}',
    )
    return typeof parsed === 'object' && parsed !== null
      ? (parsed as Record<string, Vote>)
      : {}
  } catch {
    return {}
  }
}

export function getVote(commentId: number): Vote | undefined {
  const vote = readAll()[commentId]
  return vote === 1 || vote === -1 ? vote : undefined
}

export function saveVote(commentId: number, vote: Vote): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...readAll(), [commentId]: vote }),
    )
  } catch {
    // Not remembered; the vote itself was still sent.
  }
}
