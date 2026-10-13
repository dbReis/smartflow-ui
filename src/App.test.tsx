import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from './App'
import { mockApi } from './test/mockApi'
import { renderWithProviders } from './test/render'

describe('App routes', () => {
  beforeEach(() => {
    mockApi({
      'GET /api/health': { status: 'ok' },
      'GET /api/feedback': { items: [] },
      'GET /api/category': { items: [] },
    })
  })

  it('shows the shell and the board at /', async () => {
    renderWithProviders(<App />)
    expect(screen.getByRole('link', { name: 'SmartFlow' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Feedback' }),
    ).toBeInTheDocument()
  })

  it('shows "Page not found" with a link home for unknown routes', () => {
    renderWithProviders(<App />, { route: '/nope' })
    expect(
      screen.getByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Back to the board' }),
    ).toHaveAttribute('href', '/')
  })
})
