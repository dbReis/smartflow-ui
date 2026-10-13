import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../test/render'
import { ApiStatus } from './ApiStatus'

describe('ApiStatus', () => {
  it('shows a neutral state while checking', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    )
    renderWithProviders(<ApiStatus />)
    expect(screen.getByRole('status')).toHaveTextContent('Checking API…')
  })

  it('AC-5: shows "API online" when the health check succeeds', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(Response.json({ status: 'ok' })),
    )
    renderWithProviders(<ApiStatus />)
    expect(await screen.findByText('API online')).toBeInTheDocument()
  })

  it('AC-6: shows "API offline" with the reason when the API is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed')))
    renderWithProviders(<ApiStatus />)
    expect(await screen.findByText('API offline')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAttribute(
      'title',
      'Cannot reach the API.',
    )
  })

  it('AC-6: shows the HTTP status when the API answers with an error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 502 })),
    )
    renderWithProviders(<ApiStatus />)
    expect(await screen.findByText('API offline')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAttribute(
      'title',
      'The API answered HTTP 502.',
    )
  })
})
