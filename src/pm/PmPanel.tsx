import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import {
  useCreateCategory,
  useMerge,
  useSetCategory,
  useSetStatus,
} from '../api/mutations'
import { useCategories, useFeedbackList } from '../api/queries'
import type { Feedback, FeedbackStatus } from '../api/types'
import { ErrorMessage } from '../components/ErrorMessage'
import { STATUS_LABELS } from '../lib/status'
import { usePmMode } from './pmStore'

const NEW_CATEGORY = 'new'
const NO_CATEGORY = ''

const fieldClass =
  'mt-1 block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-accent-600 focus:outline-none disabled:opacity-60'
const primaryButton =
  'rounded-lg bg-accent-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-700 disabled:opacity-60'
const secondaryButton =
  'rounded-lg px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100'

/** PM controls for an active feedback; renders nothing outside PM mode. */
export function PmPanel({ feedback }: { feedback: Feedback }) {
  const { active } = usePmMode()
  if (!active || feedback.merged_into_id !== null) return null

  return (
    <section
      aria-labelledby="pm-heading"
      className="space-y-5 rounded-2xl border border-accent-600/30 bg-accent-50/50 p-6"
    >
      <h2 id="pm-heading" className="text-sm font-semibold text-accent-700">
        Product Manager
      </h2>
      <div className="grid gap-5 sm:grid-cols-2">
        <StatusControl feedback={feedback} />
        <CategoryControl feedback={feedback} />
      </div>
      <MergeControl feedback={feedback} />
    </section>
  )
}

function StatusControl({ feedback }: { feedback: Feedback }) {
  const setStatus = useSetStatus(feedback.id)
  return (
    <div>
      <label htmlFor="pm-status" className="text-sm font-medium">
        Status
      </label>
      <select
        id="pm-status"
        value={feedback.status}
        disabled={setStatus.isPending}
        onChange={(event) =>
          setStatus.mutate(event.target.value as FeedbackStatus)
        }
        className={fieldClass}
      >
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {setStatus.isError && (
        <div className="mt-2">
          <ErrorMessage error={setStatus.error} />
        </div>
      )}
    </div>
  )
}

function CategoryControl({ feedback }: { feedback: Feedback }) {
  const categories = useCategories()
  const setCategory = useSetCategory(feedback.id)
  const [creating, setCreating] = useState(false)

  function handleChange(value: string) {
    if (value === NEW_CATEGORY) {
      setCreating(true)
      return
    }
    setCategory.mutate(value === NO_CATEGORY ? null : Number(value))
  }

  return (
    <div>
      <label htmlFor="pm-category" className="text-sm font-medium">
        Category
      </label>
      <select
        id="pm-category"
        value={
          creating ? NEW_CATEGORY : String(feedback.category_id ?? NO_CATEGORY)
        }
        disabled={setCategory.isPending || categories.isPending}
        onChange={(event) => handleChange(event.target.value)}
        className={fieldClass}
      >
        <option value={NO_CATEGORY}>No category</option>
        {categories.data?.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
        <option value={NEW_CATEGORY}>New category…</option>
      </select>
      {categories.isError && (
        <div className="mt-2">
          <ErrorMessage error={categories.error} />
        </div>
      )}
      {setCategory.isError && (
        <div className="mt-2">
          <ErrorMessage error={setCategory.error} />
        </div>
      )}
      {creating && (
        <NewCategoryForm
          onCreated={(id) => {
            setCreating(false)
            setCategory.mutate(id)
          }}
          onCancel={() => setCreating(false)}
        />
      )}
    </div>
  )
}

interface NewCategoryFormProps {
  onCreated: (categoryId: number) => void
  onCancel: () => void
}

function NewCategoryForm({ onCreated, onCancel }: NewCategoryFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const create = useCreateCategory()

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = description.trim()
    create.mutate(
      trimmed
        ? { name: name.trim(), description: trimmed }
        : { name: name.trim() },
      { onSuccess: (category) => onCreated(category.id) },
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="New category"
      className="mt-3 space-y-3 rounded-xl border border-neutral-200 bg-white p-4"
    >
      <div>
        <label htmlFor="category-name" className="text-sm font-medium">
          Name
        </label>
        <input
          id="category-name"
          required
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={fieldClass}
        />
      </div>
      <div>
        <label htmlFor="category-description" className="text-sm font-medium">
          Description{' '}
          <span className="font-normal text-neutral-400">(optional)</span>
        </label>
        <input
          id="category-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className={fieldClass}
        />
      </div>
      {create.isError && <ErrorMessage error={create.error} />}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className={secondaryButton}>
          Cancel
        </button>
        <button
          type="submit"
          disabled={create.isPending}
          className={primaryButton}
        >
          {create.isPending ? 'Creating…' : 'Create'}
        </button>
      </div>
    </form>
  )
}

function MergeControl({ feedback }: { feedback: Feedback }) {
  const list = useFeedbackList()
  const merge = useMerge(feedback.id)
  const navigate = useNavigate()
  const [targetId, setTargetId] = useState('')
  const [confirming, setConfirming] = useState(false)
  const targets = (list.data ?? []).filter((item) => item.id !== feedback.id)

  function confirm() {
    const target = Number(targetId)
    merge.mutate(target, {
      onSuccess: () => navigate(`/feedback/${target}`),
      onSettled: () => setConfirming(false),
    })
  }

  return (
    <div>
      <label htmlFor="pm-merge" className="text-sm font-medium">
        Merge into…
      </label>
      <div className="mt-1 flex gap-2">
        <select
          id="pm-merge"
          value={targetId}
          disabled={confirming || merge.isPending}
          onChange={(event) => setTargetId(event.target.value)}
          className={`${fieldClass} mt-0`}
        >
          <option value="">Choose a feedback</option>
          {targets.map((item) => (
            <option key={item.id} value={item.id}>
              #{item.id} – {shorten(item.note)}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!targetId || confirming}
          onClick={() => setConfirming(true)}
          className={primaryButton}
        >
          Merge
        </button>
      </div>
      {list.isError && (
        <div className="mt-2">
          <ErrorMessage error={list.error} />
        </div>
      )}
      {confirming && (
        <div
          role="alertdialog"
          aria-labelledby="merge-confirm"
          className="mt-3 space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4"
        >
          <p id="merge-confirm" className="text-sm">
            Merge #{feedback.id} into #{targetId}? Its comments move to #
            {targetId} and #{feedback.id} becomes read-only.
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className={secondaryButton}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={merge.isPending}
              className={primaryButton}
            >
              {merge.isPending ? 'Merging…' : 'Confirm merge'}
            </button>
          </div>
        </div>
      )}
      {merge.isError && (
        <div className="mt-2">
          <ErrorMessage error={merge.error} />
        </div>
      )}
    </div>
  )
}

function shorten(note: string | null): string {
  if (!note) return 'No note'
  return note.length > 50 ? `${note.slice(0, 50).trimEnd()}…` : note
}
