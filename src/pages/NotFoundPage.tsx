import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <section className="py-16 text-center">
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="mt-2 text-neutral-500">There is nothing at this address.</p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-700"
      >
        Back to the board
      </Link>
    </section>
  )
}
