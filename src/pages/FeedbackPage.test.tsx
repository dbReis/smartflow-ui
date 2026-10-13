import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from '../App'
import { comment, feedback, uxCategory } from '../test/fixtures'
import { apiError, mockApi } from '../test/mockApi'
import { renderWithProviders } from '../test/render'

const base = {
  'GET /api/health': { status: 'ok' },
  'GET /api/category': { items: [uxCategory] },
}

function renderPage(route = '/feedback/7') {
  return renderWithProviders(<App />, { route })
}

afterEach(() => localStorage.clear())

describe('Feedback detail (spec 005)', () => {
  it('AC-1: shows the feedback', async () => {
    mockApi({
      ...base,
      'GET /api/feedback/7': feedback(),
      'GET /api/feedback/7/comments': { items: [] },
    })
    renderPage()
    expect(await screen.findByText('Feedback #7')).toBeVisible()
    expect(screen.getByRole('img', { name: 'Rated 3 out of 5' })).toBeVisible()
    expect(screen.getByText(/Line one/)).toHaveTextContent('Line one Line two')
    expect(screen.getByText('In backlog')).toBeVisible()
    expect(await screen.findByText('UX')).toBeVisible()
    expect(
      screen.getByRole('link', { name: '← Back to the board' }),
    ).toBeVisible()
  })

  it('AC-2, AC-6: shows merged feedback as read-only, pointing at the target', async () => {
    mockApi({ ...base, 'GET /api/feedback/7': feedback({ merged_into_id: 2 }) })
    renderPage()
    expect(await screen.findByText(/Merged into/)).toBeVisible()
    for (const link of screen.getAllByRole('link', { name: '#2' })) {
      expect(link).toHaveAttribute('href', '/feedback/2')
    }
    expect(screen.queryByRole('form', { name: 'Add a comment' })).toBeNull()
  })

  it('AC-3: shows "not found" for a 404', async () => {
    mockApi({
      ...base,
      'GET /api/feedback/7': apiError(404, 'Feedback 7 not found'),
    })
    renderPage()
    expect(
      await screen.findByRole('heading', { name: 'Feedback #7 not found' }),
    ).toBeVisible()
  })

  it('AC-3: shows "not found" for a non-numeric id without calling the API', async () => {
    const fetch = mockApi(base)
    renderPage('/feedback/abc')
    expect(
      screen.getByRole('heading', { name: 'Feedback #abc not found' }),
    ).toBeVisible()
    const paths = fetch.mock.calls.map(([r]) => new URL(r.url).pathname)
    expect(paths.filter((p) => p.startsWith('/api/feedback'))).toEqual([])
  })

  it('AC-4: shows errors with "Try again"', async () => {
    mockApi({ ...base, 'GET /api/feedback/7': apiError(500, 'boom') })
    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent('boom')
    expect(screen.getByRole('button', { name: 'Try again' })).toBeVisible()
  })
})

describe('Comments and votes (spec 006)', () => {
  it('AC-1: lists comments best first, ties oldest first', async () => {
    mockApi({
      ...base,
      'GET /api/feedback/7': feedback(),
      'GET /api/feedback/7/comments': {
        items: [
          comment({ id: 1, comment: 'Low', score: -1 }),
          comment({ id: 3, comment: 'Tie newer', score: 2 }),
          comment({ id: 2, comment: 'Tie older', score: 2 }),
        ],
      },
    })
    renderPage()
    const items = await screen.findAllByRole('listitem')
    expect(items.map((item) => item.textContent)).toEqual([
      expect.stringContaining('Tie older'),
      expect.stringContaining('Tie newer'),
      expect.stringContaining('Low'),
    ])
  })

  it('AC-2: shows an empty state', async () => {
    mockApi({
      ...base,
      'GET /api/feedback/7': feedback(),
      'GET /api/feedback/7/comments': { items: [] },
    })
    renderPage()
    expect(
      await screen.findByText('No comments yet. Start the discussion.'),
    ).toBeVisible()
  })

  it('AC-3: votes once, then shows the vote and disables both arrows', async () => {
    let score = 0
    const fetch = mockApi({
      ...base,
      'GET /api/feedback/7': feedback(),
      'GET /api/feedback/7/comments': () => ({ items: [comment({ score })] }),
      'POST /api/comments/1/notation': async (request: Request) => {
        score += ((await request.json()) as { notation: number }).notation
        return Response.json(
          { id: 1, comment_id: 1, notation: 1 },
          { status: 201 },
        )
      },
    })
    renderPage()
    await userEvent.click(await screen.findByRole('button', { name: 'Upvote' }))
    expect(await screen.findByLabelText('Score 1')).toBeVisible()
    const item = within(screen.getByRole('listitem'))
    expect(item.getByRole('button', { name: 'Upvote' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(item.getByRole('button', { name: 'Upvote' })).toBeDisabled()
    expect(item.getByRole('button', { name: 'Downvote' })).toBeDisabled()
    const votes = fetch.mock.calls.filter(([r]) => r.method === 'POST')
    expect(votes).toHaveLength(1)
  })

  it('AC-4: validates, posts the trimmed comment and clears the form', async () => {
    const fetch = mockApi({
      ...base,
      'GET /api/feedback': { items: [] },
      'GET /api/feedback/7': feedback(),
      'GET /api/feedback/7/comments': { items: [] },
      'POST /api/feedback/7/comments': () =>
        Response.json(
          { id: 5, feedback_id: 7, comment: 'Yes' },
          { status: 201 },
        ),
    })
    renderPage()
    const button = await screen.findByRole('button', { name: 'Comment' })
    await userEvent.click(button)
    expect(screen.getByText('Write a comment first.')).toBeVisible()

    await userEvent.type(screen.getByLabelText('Your comment'), '  Yes  ')
    await userEvent.click(button)
    await screen.findByRole('button', { name: 'Comment' })
    const post = fetch.mock.calls.find(([r]) => r.method === 'POST')
    expect(await post![0].json()).toEqual({ comment: 'Yes' })
    expect(screen.getByLabelText('Your comment')).toHaveValue('')
  })

  it('AC-5: shows API errors from voting and commenting', async () => {
    mockApi({
      ...base,
      'GET /api/feedback/7': feedback(),
      'GET /api/feedback/7/comments': { items: [comment()] },
      'POST /api/comments/1/notation': apiError(404, 'Comment 1 not found'),
      'POST /api/feedback/7/comments': apiError(409, 'Feedback 7 was merged'),
    })
    renderPage()
    await userEvent.click(await screen.findByRole('button', { name: 'Upvote' }))
    expect(await screen.findByText('Comment 1 not found')).toBeVisible()
    await userEvent.type(screen.getByLabelText('Your comment'), 'Hi')
    await userEvent.click(screen.getByRole('button', { name: 'Comment' }))
    expect(await screen.findByText('Feedback 7 was merged')).toBeVisible()
  })
})
