import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, call, pmApi } from './client'
import { queryKeys } from './queries'
import type { FeedbackStatus, Rating } from './types'

export function useCreateFeedback() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { rating: Rating; note?: string }) =>
      call(api.POST('/api/feedback', { body: input })),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.feedbackList }),
  })
}

export function useAddComment(feedbackId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (comment: string) =>
      call(
        api.POST('/api/feedback/{feedback_id}/comments', {
          params: { path: { feedback_id: feedbackId } },
          body: { comment },
        }),
      ),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.comments(feedbackId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.feedbackList,
          exact: true,
        }),
      ]),
  })
}

export function useVote(feedbackId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ commentId, vote }: { commentId: number; vote: 1 | -1 }) =>
      call(
        api.POST('/api/comments/{comment_id}/notation', {
          params: { path: { comment_id: commentId } },
          body: { notation: vote },
        }),
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments(feedbackId),
      }),
  })
}

/** After a PM change: the feedback's page and the board. */
function refreshFeedback(
  queryClient: ReturnType<typeof useQueryClient>,
  feedbackId: number,
) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.feedback(feedbackId) }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.feedbackList,
      exact: true,
    }),
  ])
}

export function useSetStatus(feedbackId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (status: FeedbackStatus) =>
      call(
        pmApi.PUT('/api/feedback/{feedback_id}/status', {
          params: { path: { feedback_id: feedbackId } },
          body: { status },
        }),
      ),
    onSuccess: () => refreshFeedback(queryClient, feedbackId),
  })
}

export function useSetCategory(feedbackId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (categoryId: number | null) =>
      call(
        pmApi.PUT('/api/feedback/{feedback_id}/category', {
          params: { path: { feedback_id: feedbackId } },
          body: { category_id: categoryId },
        }),
      ),
    onSuccess: () => refreshFeedback(queryClient, feedbackId),
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { name: string; description?: string }) =>
      call(pmApi.POST('/api/category', { body: input })),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
  })
}

export function useMerge(feedbackId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (targetId: number) =>
      call(
        pmApi.POST('/api/feedback/{feedback_id}/merge', {
          params: { path: { feedback_id: feedbackId } },
          body: { target_id: targetId },
        }),
      ),
    // Source, target, both comment lists and the board all change.
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.feedbackList }),
  })
}
