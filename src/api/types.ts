import type { components } from './schema'

type Schemas = components['schemas']

export type FeedbackStatus = Schemas['FeedbackStatus']
export type Rating = Schemas['RatingValue']
export type NotationValue = Schemas['NotationValue']

export type Feedback = Schemas['FeedbackOut']
export type Comment = Schemas['CommentOut']
// NotationOut types notation as a plain integer, although the API only ever
// returns -1, 0 or 1 (database CHECK constraint).
export type Notation = Omit<Schemas['NotationOut'], 'notation'> & {
  notation: NotationValue
}
export type Category = Schemas['CategoryOut']
export type FeedbackListItem = Schemas['FeedbackSummaryOut']
export type CommentWithScore = Schemas['CommentWithScoreOut']
