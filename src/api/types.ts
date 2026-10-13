import type { components } from './schema'

type Schemas = components['schemas']

export type FeedbackStatus = Schemas['FeedbackStatus']
export type Rating = Schemas['RatingValue']
export type NotationValue = Schemas['NotationValue']

// The API's FeedbackOut types status and rating as plain string/integer,
// although it only ever returns the enum values (database CHECK constraints).
// Narrowed here until the API's spec uses the enums (spec 002, open question 1).
export type Feedback = Omit<Schemas['FeedbackOut'], 'status' | 'rating'> & {
  status: FeedbackStatus
  rating: Rating
}
export type Comment = Schemas['CommentOut']
export type Notation = Omit<Schemas['NotationOut'], 'notation'> & {
  notation: NotationValue
}
export type Category = Schemas['CategoryOut']
export type FeedbackListItem = Omit<
  Schemas['FeedbackSummaryOut'],
  'status' | 'rating'
> & {
  status: FeedbackStatus
  rating: Rating
}
export type CommentWithScore = Schemas['CommentWithScoreOut']
