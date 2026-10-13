import { ApiError } from '../api/errors'

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.'

/** Shows any error the same way. Only ApiError messages are shown as is. */
export function ErrorMessage({ error }: { error: unknown }) {
  const message = error instanceof ApiError ? error.message : FALLBACK_MESSAGE
  return (
    <p
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {message}
    </p>
  )
}
