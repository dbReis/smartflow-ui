import { Link, Outlet } from 'react-router'
import { PmToggle } from '../pm/PmToggle'
import { ApiStatus } from './ApiStatus'

export function Layout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            SmartFlow
          </Link>
          <div className="flex items-center gap-5">
            <ApiStatus />
            <PmToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Outlet />
      </main>
    </div>
  )
}
