import { useCategoryMap, useFeedbackList } from '../api/queries'
import { FeedbackCard } from '../components/FeedbackCard'
import { NewFeedbackForm } from '../components/NewFeedbackForm'
import { QueryError } from '../components/QueryError'

export function BoardPage() {
  const feedback = useFeedbackList()
  const categories = useCategoryMap()

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Feedback</h1>
      <NewFeedbackForm />
      <section aria-label="All feedback" className="space-y-4">
        {feedback.isPending ? (
          <BoardSkeleton />
        ) : feedback.isError ? (
          <QueryError
            error={feedback.error}
            onRetry={() => void feedback.refetch()}
          />
        ) : feedback.data.length === 0 ? (
          <EmptyBoard />
        ) : (
          feedback.data.map((item) => (
            <FeedbackCard
              key={item.id}
              feedback={item}
              categoryName={
                item.category_id === null
                  ? undefined
                  : categories.get(item.category_id)?.name
              }
            />
          ))
        )}
      </section>
    </div>
  )
}

function BoardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading feedback" className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-2xl border border-neutral-200 bg-white"
        />
      ))}
    </div>
  )
}

function EmptyBoard() {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-300 px-6 py-12 text-center">
      <p className="font-medium">No feedback yet</p>
      <p className="mt-1 text-sm text-neutral-500">
        Be the first: tell us what you think.
      </p>
    </div>
  )
}
