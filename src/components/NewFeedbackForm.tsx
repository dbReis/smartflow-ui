import { useState, type FormEvent } from 'react'
import { useCreateFeedback } from '../api/mutations'
import type { Rating } from '../api/types'
import { ErrorMessage } from './ErrorMessage'
import { StarPicker } from './StarPicker'

const NOTE_MAX_LENGTH = 20_000

export function NewFeedbackForm() {
  const [rating, setRating] = useState<Rating | null>(null)
  const [note, setNote] = useState('')
  const [missingRating, setMissingRating] = useState(false)
  const [thanks, setThanks] = useState(false)
  const create = useCreateFeedback()

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setThanks(false)
    if (rating === null) {
      setMissingRating(true)
      return
    }
    const trimmed = note.trim()
    create.mutate(trimmed ? { rating, note: trimmed } : { rating }, {
      onSuccess: () => {
        setRating(null)
        setNote('')
        setThanks(true)
      },
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="New feedback"
      className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
    >
      <StarPicker
        value={rating}
        onChange={(value) => {
          setRating(value)
          setMissingRating(false)
        }}
        describedBy={missingRating ? 'rating-error' : undefined}
      />
      {missingRating && (
        <p id="rating-error" className="text-sm text-red-600">
          Choose a rating.
        </p>
      )}
      <div>
        <label htmlFor="note" className="text-sm font-medium">
          Note <span className="font-normal text-neutral-400">(optional)</span>
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={NOTE_MAX_LENGTH}
          rows={3}
          placeholder="What works, what doesn't?"
          className="mt-2 block w-full resize-y rounded-lg border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-accent-600 focus:outline-none"
        />
      </div>
      {create.isError && <ErrorMessage error={create.error} />}
      {thanks && (
        <p role="status" className="text-sm text-emerald-700">
          Thanks for your feedback!
        </p>
      )}
      <button
        type="submit"
        disabled={create.isPending}
        className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-700 disabled:opacity-60"
      >
        {create.isPending ? 'Sending…' : 'Post feedback'}
      </button>
    </form>
  )
}
