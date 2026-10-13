import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from '../App'
import { getPmKey } from '../api/pmKey'
import { feedback, uxCategory } from '../test/fixtures'
import { apiError, mockApi } from '../test/mockApi'
import { renderWithProviders } from '../test/render'

const base = {
  'GET /api/health': { status: 'ok' },
  'GET /api/feedback': { items: [] },
  'GET /api/category': { items: [uxCategory] },
}

async function enterKey(key: string) {
  await userEvent.click(screen.getByRole('button', { name: 'PM mode' }))
  await userEvent.type(screen.getByLabelText('PM key'), key)
  await userEvent.click(screen.getByRole('button', { name: 'Enter' }))
}

describe('PM mode (spec 007)', () => {
  it('AC-1, AC-2: checks the key, then shows the PM badge', async () => {
    const fetch = mockApi({
      ...base,
      'GET /api/pm/session': () => new Response(null, { status: 204 }),
    })
    renderWithProviders(<App />)
    await enterKey('s3cret')
    expect(await screen.findByText('PM')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Exit PM mode' })).toBeVisible()
    expect(getPmKey()).toBe('s3cret')
    const check = fetch.mock.calls.find(
      ([r]) => new URL(r.url).pathname === '/api/pm/session',
    )
    expect(check![0].headers.get('Authorization')).toBe('Bearer s3cret')
  })

  it.each([
    [401, 'Invalid PM key'],
    [503, 'PM features are not configured'],
  ])(
    'AC-3: shows the API message for %i and stays off',
    async (status, message) => {
      mockApi({ ...base, 'GET /api/pm/session': apiError(status, message) })
      renderWithProviders(<App />)
      await enterKey('wrong')
      expect(await screen.findByRole('alert')).toHaveTextContent(message)
      expect(getPmKey()).toBeNull()
      expect(screen.queryByRole('button', { name: 'Exit PM mode' })).toBeNull()
    },
  )

  it('AC-4: "Exit PM mode" removes the key', async () => {
    mockApi({
      ...base,
      'GET /api/pm/session': () => new Response(null, { status: 204 }),
    })
    renderWithProviders(<App />)
    await enterKey('s3cret')
    await userEvent.click(
      await screen.findByRole('button', { name: 'Exit PM mode' }),
    )
    expect(getPmKey()).toBeNull()
    expect(screen.getByRole('button', { name: 'PM mode' })).toBeVisible()
  })

  it('AC-5: leaves PM mode when a PM request gets a 401', async () => {
    mockApi({
      ...base,
      'GET /api/pm/session': () => new Response(null, { status: 204 }),
      'GET /api/feedback/7': feedback(),
      'GET /api/feedback/7/comments': { items: [] },
      'PUT /api/feedback/7/status': apiError(401, 'Invalid PM key'),
    })
    renderWithProviders(<App />, { route: '/feedback/7' })
    await enterKey('s3cret')
    await userEvent.selectOptions(
      await screen.findByLabelText('Status'),
      'closed_solved',
    )
    expect(
      await screen.findByText('Your PM key was rejected. Enter it again.'),
    ).toBeVisible()
    expect(getPmKey()).toBeNull()
    expect(screen.queryByLabelText('Status')).toBeNull()
  })
})
