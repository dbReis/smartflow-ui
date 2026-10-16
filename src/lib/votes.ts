// Remembers this browser's vote per comment, so the pressed arrow survives a
// reload. The API keeps the vote itself (one per X-User-Id, see api/userId.ts)
// but does not return it with the comments (spec 012).
import type { NotationValue } from '../api/types'

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

/** Remembers the notation the API accepted; 0 forgets the vote. */
export function saveVote(commentId: number, notation: NotationValue): void {
  const { [commentId]: _previous, ...others } = readAll()
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        notation === 0 ? others : { ...others, [commentId]: notation },
      ),
    )
  } catch {
    // Not remembered; the vote itself was still sent.
  }
}

/**
 * ▲ adds 1 and ▼ takes 1 away from the user's vote, which stays within -1..1:
 * from +1, ▼ gives 0; from 0 (or no vote), ▼ gives -1 (spec 012).
 */
export function nextNotation(
  current: Vote | undefined,
  step: Vote,
): NotationValue {
  return Math.max(-1, Math.min(1, (current ?? 0) + step)) as NotationValue
}
