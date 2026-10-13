import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'
import { renderWithProviders } from './test/render'

describe('App routes', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(Response.json({ status: 'ok' })),
    )
  })

  it('AC-2: shows the shell and the home placeholder at /', async () => {
    renderWithProviders(<App />)
    expect(screen.getByRole('link', { name: 'SmartFlow' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Feedback board' }),
    ).toBeInTheDocument()
  })

  it('AC-3: shows "Page not found" with a link home for unknown routes', () => {
    renderWithProviders(<App />, { route: '/nope' })
    expect(
      screen.getByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Back to the board' }),
    ).toHaveAttribute('href', '/')
  })
})
