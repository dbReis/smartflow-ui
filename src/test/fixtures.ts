import type {
  Category,
  CommentWithScore,
  Feedback,
  FeedbackListItem,
} from '../api/types'

export function listItem(
  overrides: Partial<FeedbackListItem> = {},
): FeedbackListItem {
  return {
    id: 1,
    rating: 4,
    note: 'Nice app',
    status: 'open',
    category_id: null,
    merged_into_id: null,
    comment_count: 0,
    ...overrides,
  }
}

export const uxCategory: Category = { id: 3, name: 'UX', description: null }

export function feedback(overrides: Partial<Feedback> = {}): Feedback {
  return {
    id: 7,
    rating: 3,
    note: 'Line one\nLine two',
    status: 'closed_backlog',
    category_id: 3,
    merged_into_id: null,
    ...overrides,
  }
}

export function comment(
  overrides: Partial<CommentWithScore> = {},
): CommentWithScore {
  return {
    id: 1,
    feedback_id: 7,
    comment: 'Agreed',
    score: 0,
    votes: 0,
    ...overrides,
  }
}
