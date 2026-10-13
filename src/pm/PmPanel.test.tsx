import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from '../App'
import { setPmKey } from '../api/pmKey'
import { feedback, listItem, uxCategory } from '../test/fixtures'
import { apiError, mockApi } from '../test/mockApi'
import { renderWithProviders } from '../test/render'
import { pmMode } from './pmStore'

const base = {
  'GET /api/health': { status: 'ok' },
  'GET /api/category': { items: [uxCategory] },
  'GET /api/feedback/7/comments': { items: [] },
  'GET /api/feedback': {
    items: [
      listItem({ id: 7, note: 'This one' }),
      listItem({
        id: 2,
        note: 'The original report of the slow search page, with details',
      }),
    ],
  },
  'GET /api/pm/session': () => new Response(null, { status: 204 }),
}

async function enterPmMode() {
  setPmKey('s3cret')
  await pmMode.enter('s3cret')
}

function bodies(
  fetch: ReturnType<typeof mockApi>,
  method: string,
  path: string,
) {
  return Promise.all(
    fetch.mock.calls
      .filter(([r]) => r.method === method && new URL(r.url).pathname === path)
      .map(([r]) => r.clone().json()),
  )
}

describe('PM status and category (spec 008)', () => {
  it('AC-1: shows no PM controls outside PM mode or on merged feedback', async () => {
    mockApi({ ...base, 'GET /api/feedback/7': feedback() })
    const { unmount } = renderWithProviders(<App />, { route: '/feedback/7' })
    await screen.findByText('Feedback #7')
    expect(screen.queryByLabelText('Status')).toBeNull()
    unmount()

    mockApi({ ...base, 'GET /api/feedback/7': feedback({ merged_into_id: 2 }) })
    await enterPmMode()
    renderWithProviders(<App />, { route: '/feedback/7' })
    await screen.findByText(/Merged into/)
    expect(screen.queryByLabelText('Status')).toBeNull()
  })

  it('AC-2, AC-3: sends status and category changes', async () => {
    const fetch = mockApi({
      ...base,
      'GET /api/feedback/7': feedback(),
      'PUT /api/feedback/7/status': feedback({ status: 'closed_solved' }),
      'PUT /api/feedback/7/category': feedback({ category_id: null }),
    })
    await enterPmMode()
    renderWithProviders(<App />, { route: '/feedback/7' })
    await userEvent.selectOptions(
      await screen.findByLabelText('Status'),
      'Solved',
    )
    await userEvent.selectOptions(
      screen.getByLabelText('Category'),
      'No category',
    )
    await screen.findByLabelText('Category')
    expect(await bodies(fetch, 'PUT', '/api/feedback/7/status')).toEqual([
      { status: 'closed_solved' },
    ])
    expect(await bodies(fetch, 'PUT', '/api/feedback/7/category')).toEqual([
      { category_id: null },
    ])
  })

  it('AC-4: creates a category and assigns it', async () => {
    const fetch = mockApi({
      ...base,
      'GET /api/feedback/7': feedback(),
      'POST /api/category': () =>
        Response.json(
          { id: 8, name: 'Search', description: null },
          { status: 201 },
        ),
      'PUT /api/feedback/7/category': feedback({ category_id: 8 }),
    })
    await enterPmMode()
    renderWithProviders(<App />, { route: '/feedback/7' })
    await screen.findByRole('option', { name: 'UX' })
    await userEvent.selectOptions(
      screen.getByLabelText('Category'),
      'New category…',
    )
    await userEvent.type(screen.getByLabelText('Name'), ' Search ')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    await screen.findByLabelText('Category')
    await expect
      .poll(() => bodies(fetch, 'PUT', '/api/feedback/7/category'))
      .toEqual([{ category_id: 8 }])
    expect(await bodies(fetch, 'POST', '/api/category')).toEqual([
      { name: 'Search' },
    ])
  })

  it('AC-5: shows API errors', async () => {
    mockApi({
      ...base,
      'GET /api/feedback/7': feedback(),
      'PUT /api/feedback/7/status': apiError(409, 'Feedback 7 was merged'),
    })
    await enterPmMode()
    renderWithProviders(<App />, { route: '/feedback/7' })
    await userEvent.selectOptions(
      await screen.findByLabelText('Status'),
      'Rejected',
    )
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Feedback 7 was merged',
    )
  })
})

describe('PM merge (spec 009)', () => {
  it('AC-1: lists other active feedback only', async () => {
    mockApi({ ...base, 'GET /api/feedback/7': feedback() })
    await enterPmMode()
    renderWithProviders(<App />, { route: '/feedback/7' })
    const select = await screen.findByLabelText('Merge into…')
    await screen.findByRole('option', { name: /^#2/ })
    const options = [...(select as HTMLSelectElement).options].map(
      (o) => o.text,
    )
    expect(options).toEqual([
      'Choose a feedback',
      '#2 – The original report of the slow search page, with…',
    ])
  })

  it('AC-2, AC-3: confirms, merges and goes to the target', async () => {
    const fetch = mockApi({
      ...base,
      'GET /api/feedback/7': feedback(),
      'GET /api/feedback/2': feedback({ id: 2, note: 'Target' }),
      'GET /api/feedback/2/comments': { items: [] },
      'POST /api/feedback/7/merge': feedback({ id: 2 }),
    })
    await enterPmMode()
    renderWithProviders(<App />, { route: '/feedback/7' })
    await userEvent.selectOptions(
      await screen.findByLabelText('Merge into…'),
      await screen.findByRole('option', { name: /^#2/ }),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Merge' }))
    expect(screen.getByRole('alertdialog')).toHaveTextContent(
      'Merge #7 into #2? Its comments move to #2 and #7 becomes read-only.',
    )
    expect(fetch.mock.calls.some(([r]) => r.method === 'POST')).toBe(false)
    await userEvent.click(screen.getByRole('button', { name: 'Confirm merge' }))
    expect(await screen.findByText('Feedback #2')).toBeVisible()
    expect(await bodies(fetch, 'POST', '/api/feedback/7/merge')).toEqual([
      { target_id: 2 },
    ])
  })

  it('AC-4: shows API errors and stays', async () => {
    mockApi({
      ...base,
      'GET /api/feedback/7': feedback(),
      'POST /api/feedback/7/merge': apiError(409, 'Feedback 2 was merged'),
    })
    await enterPmMode()
    renderWithProviders(<App />, { route: '/feedback/7' })
    await userEvent.selectOptions(
      await screen.findByLabelText('Merge into…'),
      await screen.findByRole('option', { name: /^#2/ }),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Merge' }))
    await userEvent.click(screen.getByRole('button', { name: 'Confirm merge' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Feedback 2 was merged',
    )
    expect(screen.getByText('Feedback #7')).toBeVisible()
  })
})
