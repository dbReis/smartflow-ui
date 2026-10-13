import { ErrorMessage } from './ErrorMessage'

/** An error plus a way out: shown wherever a query fails. */
export function QueryError({
  error,
  onRetry,
}: {
  error: unknown
  onRetry: () => void
}) {
  return (
    <div className="space-y-3">
      <ErrorMessage error={error} />
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-neutral-50"
      >
        Try again
      </button>
    </div>
  )
}
