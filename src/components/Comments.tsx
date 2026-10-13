import { useState, type FormEvent } from 'react'
import { useAddComment, useVote } from '../api/mutations'
import { useComments } from '../api/queries'
import type { CommentWithScore } from '../api/types'
import { getVote, saveVote, type Vote } from '../lib/votes'
import { ErrorMessage } from './ErrorMessage'
import { QueryError } from './QueryError'

const COMMENT_MAX_LENGTH = 2000

export function Comments({ feedbackId }: { feedbackId: number }) {
  const comments = useComments(feedbackId)
  const vote = useVote(feedbackId)

  return (
    <section aria-labelledby="comments-heading" className="space-y-4">
      <h2 id="comments-heading" className="text-lg font-semibold">
        Comments
      </h2>
      {vote.isError && <ErrorMessage error={vote.error} />}
      {comments.isPending ? (
        <div
          aria-busy="true"
          aria-label="Loading comments"
          className="h-20 animate-pulse rounded-xl bg-neutral-100"
        />
      ) : comments.isError ? (
        <QueryError
          error={comments.error}
          onRetry={() => void comments.refetch()}
        />
      ) : comments.data.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No comments yet. Start the discussion.
        </p>
      ) : (
        <ul className="space-y-3">
          {comments.data.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              voting={vote.isPending && vote.variables.commentId === comment.id}
              onVote={(value) =>
                vote.mutate(
                  { commentId: comment.id, vote: value },
                  { onSuccess: () => saveVote(comment.id, value) },
                )
              }
            />
          ))}
        </ul>
      )}
      <CommentForm feedbackId={feedbackId} />
    </section>
  )
}

interface CommentItemProps {
  comment: CommentWithScore
  voting: boolean
  onVote: (vote: Vote) => void
}

function CommentItem({ comment, voting, onVote }: CommentItemProps) {
  // Read on each render: saveVote runs after a successful vote, just before
  // the comments refetch and re-render.
  const myVote = getVote(comment.id)
  const disabled = voting || myVote !== undefined

  return (
    <li className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex flex-col items-center text-sm">
        <VoteButton
          label="Upvote"
          symbol="▲"
          pressed={myVote === 1}
          disabled={disabled}
          onClick={() => onVote(1)}
        />
        <span
          className="font-medium tabular-nums"
          aria-label={`Score ${comment.score}`}
        >
          {comment.score}
        </span>
        <VoteButton
          label="Downvote"
          symbol="▼"
          pressed={myVote === -1}
          disabled={disabled}
          onClick={() => onVote(-1)}
        />
      </div>
      <p className="min-w-0 flex-1 break-words whitespace-pre-line">
        {comment.comment}
      </p>
    </li>
  )
}

interface VoteButtonProps {
  label: string
  symbol: string
  pressed: boolean
  disabled: boolean
  onClick: () => void
}

function VoteButton({
  label,
  symbol,
  pressed,
  disabled,
  onClick,
}: VoteButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={`rounded px-1.5 leading-6 ${pressed ? 'text-accent-600' : 'text-neutral-400'} enabled:hover:text-accent-600 disabled:cursor-default`}
    >
      {symbol}
    </button>
  )
}

function CommentForm({ feedbackId }: { feedbackId: number }) {
  const [text, setText] = useState('')
  const [empty, setEmpty] = useState(false)
  const add = useAddComment(feedbackId)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const comment = text.trim()
    if (!comment) {
      setEmpty(true)
      return
    }
    add.mutate(comment, { onSuccess: () => setText('') })
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Add a comment"
      className="space-y-3"
    >
      <label htmlFor="comment" className="sr-only">
        Your comment
      </label>
      <textarea
        id="comment"
        value={text}
        onChange={(event) => {
          setText(event.target.value)
          setEmpty(false)
        }}
        maxLength={COMMENT_MAX_LENGTH}
        rows={3}
        placeholder="Add a comment…"
        aria-describedby={empty ? 'comment-error' : undefined}
        className="block w-full resize-y rounded-lg border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-accent-600 focus:outline-none"
      />
      {empty && (
        <p id="comment-error" className="text-sm text-red-600">
          Write a comment first.
        </p>
      )}
      {add.isError && <ErrorMessage error={add.error} />}
      <button
        type="submit"
        disabled={add.isPending}
        className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-700 disabled:opacity-60"
      >
        {add.isPending ? 'Sending…' : 'Comment'}
      </button>
    </form>
  )
}
