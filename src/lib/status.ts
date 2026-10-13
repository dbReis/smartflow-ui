import type { FeedbackStatus } from '../api/types'

export const STATUS_LABELS: Record<FeedbackStatus, string> = {
  open: 'Open',
  closed_backlog: 'In backlog',
  closed_solved: 'Solved',
  closed_rejected: 'Rejected',
}
