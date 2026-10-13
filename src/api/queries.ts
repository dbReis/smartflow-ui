import { useQuery } from '@tanstack/react-query'
import { api, call } from './client'
import type { Category, Feedback, FeedbackListItem } from './types'

export const queryKeys = {
  feedbackList: ['feedback'] as const,
  feedback: (id: number) => ['feedback', id] as const,
  comments: (id: number) => ['feedback', id, 'comments'] as const,
  categories: ['categories'] as const,
}

export function useFeedbackList() {
  return useQuery({
    queryKey: queryKeys.feedbackList,
    queryFn: async (): Promise<FeedbackListItem[]> => {
      const { items } = await call(api.GET('/api/feedback'))
      // FeedbackSummaryOut types status/rating loosely; see types.ts.
      return (items as FeedbackListItem[]).sort((a, b) => b.id - a.id)
    },
  })
}

export function useFeedback(id: number) {
  return useQuery({
    queryKey: queryKeys.feedback(id),
    queryFn: async () =>
      // FeedbackOut types status/rating loosely; see types.ts.
      (await call(
        api.GET('/api/feedback/{feedback_id}', {
          params: { path: { feedback_id: id } },
        }),
      )) as Feedback,
  })
}

export function useComments(feedbackId: number) {
  return useQuery({
    queryKey: queryKeys.comments(feedbackId),
    queryFn: async () => {
      const { items } = await call(
        api.GET('/api/feedback/{feedback_id}/comments', {
          params: { path: { feedback_id: feedbackId } },
        }),
      )
      return items.sort((a, b) => b.score - a.score || a.id - b.id)
    },
  })
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: async () => (await call(api.GET('/api/category'))).items,
    staleTime: 5 * 60_000,
  })
}

/** Category id → category, for joining names onto feedback. */
export function useCategoryMap(): Map<number, Category> {
  const { data } = useCategories()
  return new Map((data ?? []).map((category) => [category.id, category]))
}
