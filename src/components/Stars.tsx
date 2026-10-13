const STAR_PATH =
  'M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.8l-5.2 2.8 1-5.8L1.5 7.7l5.9-.9z'

export function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={`size-full ${filled ? 'fill-amber-400' : 'fill-neutral-200'}`}
    >
      <path d={STAR_PATH} />
    </svg>
  )
}

export function Stars({ rating }: { rating: number }) {
  return (
    <span
      role="img"
      aria-label={`Rated ${rating} out of 5`}
      className="inline-flex gap-0.5"
    >
      {[1, 2, 3, 4, 5].map((value) => (
        <span key={value} className="size-4">
          <Star filled={value <= rating} />
        </span>
      ))}
    </span>
  )
}
