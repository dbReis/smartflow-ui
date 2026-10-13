import type { FeedbackStatus } from '../api/types'
import { STATUS_LABELS } from '../lib/status'

const STATUS_CLASSES: Record<FeedbackStatus, string> = {
  open: 'bg-accent-50 text-accent-700',
  closed_backlog: 'bg-amber-50 text-amber-700',
  closed_solved: 'bg-emerald-50 text-emerald-700',
  closed_rejected: 'bg-neutral-100 text-neutral-600',
}

export function StatusBadge({ status }: { status: FeedbackStatus }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

export function CategoryChip({ name }: { name: string }) {
  return (
    <span className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-xs text-neutral-600">
      {name}
    </span>
  )
}
