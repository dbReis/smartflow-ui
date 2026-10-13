import { Link } from 'react-router'
import type { FeedbackListItem } from '../api/types'
import { Stars } from './Stars'
import { CategoryChip, StatusBadge } from './StatusBadge'

interface Props {
  feedback: FeedbackListItem
  categoryName?: string
}

export function FeedbackCard({ feedback, categoryName }: Props) {
  const comments = feedback.comment_count
  return (
    <Link
      to={`/feedback/${feedback.id}`}
      className="block rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-neutral-300 hover:shadow focus-visible:outline-2 focus-visible:outline-accent-600"
    >
      <div className="flex items-center justify-between gap-3">
        <Stars rating={feedback.rating} />
        <span className="text-xs text-neutral-400">#{feedback.id}</span>
      </div>
      <p
        className={`mt-3 line-clamp-3 whitespace-pre-line ${feedback.note ? '' : 'text-neutral-400 italic'}`}
      >
        {feedback.note || 'No note'}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <StatusBadge status={feedback.status} />
        {categoryName && <CategoryChip name={categoryName} />}
        <span className="ml-auto text-xs text-neutral-500">
          {comments === 1 ? '1 comment' : `${comments} comments`}
        </span>
      </div>
    </Link>
  )
}
