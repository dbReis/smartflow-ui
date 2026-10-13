import { useState } from 'react'
import type { Rating } from '../api/types'
import { Star } from './Stars'

const RATINGS: Rating[] = [1, 2, 3, 4, 5]

interface Props {
  value: Rating | null
  onChange: (rating: Rating) => void
  describedBy?: string
}

/** Five stars as a radio group: arrow keys and screen readers work natively. */
export function StarPicker({ value, onChange, describedBy }: Props) {
  const [hovered, setHovered] = useState<Rating | null>(null)
  const shown = hovered ?? value ?? 0

  return (
    <fieldset aria-describedby={describedBy}>
      <legend className="text-sm font-medium">Your rating</legend>
      <div className="mt-2 flex gap-1" onMouseLeave={() => setHovered(null)}>
        {RATINGS.map((rating) => (
          <label
            key={rating}
            className="size-8 cursor-pointer rounded has-focus-visible:outline-2 has-focus-visible:outline-accent-600"
            onMouseEnter={() => setHovered(rating)}
          >
            <input
              type="radio"
              name="rating"
              value={rating}
              checked={value === rating}
              onChange={() => onChange(rating)}
              className="sr-only"
            />
            <span className="sr-only">
              {rating === 1 ? '1 star' : `${rating} stars`}
            </span>
            <Star filled={rating <= shown} />
          </label>
        ))}
      </div>
    </fieldset>
  )
}
