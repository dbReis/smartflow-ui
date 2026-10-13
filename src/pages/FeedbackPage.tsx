import { Link, useParams } from 'react-router'
import { ApiError } from '../api/errors'
import { useCategoryMap, useFeedback } from '../api/queries'
import type { Feedback } from '../api/types'
import { Comments } from '../components/Comments'
import { QueryError } from '../components/QueryError'
import { Stars } from '../components/Stars'
import { CategoryChip, StatusBadge } from '../components/StatusBadge'
import { PmPanel } from '../pm/PmPanel'

/** Route ids match the API's: 1–9 digits. */
function parseId(param: string | undefined): number | null {
  return param && /^\d{1,9}$/.test(param) ? Number(param) : null
}

export function FeedbackPage() {
  const { id: param } = useParams()
  const id = parseId(param)
  return (
    <div className="space-y-8">
      <Link to="/" className="text-sm text-neutral-500 hover:text-neutral-900">
        ← Back to the board
      </Link>
      {id === null ? (
        <NotFound label={param ?? ''} />
      ) : (
        <FeedbackDetail key={id} id={id} />
      )}
    </div>
  )
}

function FeedbackDetail({ id }: { id: number }) {
  const feedback = useFeedback(id)

  if (feedback.isPending) {
    return (
      <div
        aria-busy="true"
        aria-label="Loading feedback"
        className="h-40 animate-pulse rounded-2xl border border-neutral-200 bg-white"
      />
    )
  }
  if (feedback.isError) {
    if (feedback.error instanceof ApiError && feedback.error.status === 404) {
      return <NotFound label={String(id)} />
    }
    return (
      <QueryError
        error={feedback.error}
        onRetry={() => void feedback.refetch()}
      />
    )
  }

  const merged = feedback.data.merged_into_id
  return (
    <>
      <FeedbackSummary feedback={feedback.data} />
      <PmPanel feedback={feedback.data} />
      {merged === null ? (
        <Comments feedbackId={id} />
      ) : (
        <p className="text-sm text-neutral-500">
          Its comments moved to{' '}
          <Link
            to={`/feedback/${merged}`}
            className="text-accent-600 underline"
          >
            #{merged}
          </Link>
          .
        </p>
      )}
    </>
  )
}

function FeedbackSummary({ feedback }: { feedback: Feedback }) {
  const categories = useCategoryMap()
  const category =
    feedback.category_id === null
      ? undefined
      : categories.get(feedback.category_id)
  const merged = feedback.merged_into_id

  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <Stars rating={feedback.rating} />
        <h1 className="text-sm text-neutral-400">Feedback #{feedback.id}</h1>
      </div>
      {merged !== null && (
        <p className="mt-4 rounded-lg bg-neutral-100 px-3 py-2 text-sm">
          Merged into{' '}
          <Link
            to={`/feedback/${merged}`}
            className="font-medium text-accent-600 underline"
          >
            #{merged}
          </Link>
        </p>
      )}
      <p
        className={`mt-4 text-lg break-words whitespace-pre-line ${
          merged !== null || !feedback.note ? 'text-neutral-400' : ''
        } ${feedback.note ? '' : 'italic'}`}
      >
        {feedback.note || 'No note'}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <StatusBadge status={feedback.status} />
        {category && <CategoryChip name={category.name} />}
      </div>
    </article>
  )
}

function NotFound({ label }: { label: string }) {
  return (
    <section className="py-12 text-center">
      <h1 className="text-xl font-semibold">Feedback #{label} not found</h1>
      <p className="mt-2 text-neutral-500">
        It may have been removed, or the link is wrong.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-700"
      >
        Back to the board
      </Link>
    </section>
  )
}
