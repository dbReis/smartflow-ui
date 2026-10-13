import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { ErrorMessage } from '../components/ErrorMessage'
import { pmMode, usePmMode } from './pmStore'

export function PmToggle() {
  const { active, notice } = usePmMode()
  const [open, setOpen] = useState(false)

  if (active) {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-accent-600 px-2 py-0.5 text-xs font-semibold text-white">
          PM
        </span>
        <button
          type="button"
          onClick={() => pmMode.exit()}
          className="text-sm text-neutral-500 hover:text-neutral-900"
        >
          Exit PM mode
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        {notice && !open && (
          <span role="status" className="text-xs text-red-600">
            {notice}
          </span>
        )}
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="text-sm text-neutral-500 hover:text-neutral-900"
        >
          PM mode
        </button>
      </div>
      {open && <PmKeyForm onClose={() => setOpen(false)} />}
    </div>
  )
}

function PmKeyForm({ onClose }: { onClose: () => void }) {
  const [key, setKey] = useState('')
  const enter = useMutation({ mutationFn: pmMode.enter, onSuccess: onClose })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (key.trim()) enter.mutate(key.trim())
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Enter PM mode"
      className="absolute right-0 z-10 mt-2 w-72 space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-lg"
    >
      <label htmlFor="pm-key" className="block text-sm font-medium">
        PM key
      </label>
      <input
        id="pm-key"
        type="password"
        autoComplete="off"
        autoFocus
        required
        value={key}
        onChange={(event) => setKey(event.target.value)}
        className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-accent-600 focus:outline-none"
      />
      {enter.isError && <ErrorMessage error={enter.error} />}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={enter.isPending}
          className="rounded-lg bg-accent-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-700 disabled:opacity-60"
        >
          {enter.isPending ? 'Checking…' : 'Enter'}
        </button>
      </div>
    </form>
  )
}
