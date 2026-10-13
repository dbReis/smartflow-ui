import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { listItem, uxCategory } from '../test/fixtures'
import { apiError, mockApi } from '../test/mockApi'
import { renderWithProviders } from '../test/render'
import { BoardPage } from './BoardPage'

describe('BoardPage', () => {
  it('AC-2, AC-3: shows one card per feedback, newest first, linking to its page', async () => {
    mockApi({
      'GET /api/feedback': {
        items: [
          listItem({ id: 1, rating: 2, note: 'Too slow' }),
          listItem({
            id: 2,
            rating: 5,
            note: 'Love it',
            status: 'closed_solved',
            category_id: 3,
            comment_count: 1,
          }),
        ],
      },
      'GET /api/category': { items: [uxCategory] },
    })
    renderWithProviders(<BoardPage />)

    const cards = await screen.findAllByRole('link')
    expect(cards).toHaveLength(2)
    expect(cards[0]).toHaveAttribute('href', '/feedback/2')
    const newest = within(cards[0])
    expect(newest.getByRole('img', { name: 'Rated 5 out of 5' })).toBeVisible()
    expect(newest.getByText('Love it')).toBeVisible()
    expect(newest.getByText('Solved')).toBeVisible()
    expect(await newest.findByText('UX')).toBeVisible()
    expect(newest.getByText('1 comment')).toBeVisible()
    expect(within(cards[1]).getByText('0 comments')).toBeVisible()
  })

  it('AC-4: shows an empty state', async () => {
    mockApi({
      'GET /api/feedback': { items: [] },
      'GET /api/category': { items: [] },
    })
    renderWithProviders(<BoardPage />)
    expect(await screen.findByText('No feedback yet')).toBeVisible()
  })

  it('AC-5: shows the error and refetches on "Try again"', async () => {
    let calls = 0
    mockApi({
      'GET /api/feedback': () =>
        ++calls === 1
          ? apiError(500, 'Database unavailable')
          : { items: [listItem()] },
      'GET /api/category': { items: [] },
    })
    renderWithProviders(<BoardPage />)
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Database unavailable',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('Nice app')).toBeVisible()
  })

  it('AC-6: still shows cards when categories fail', async () => {
    mockApi({
      'GET /api/feedback': { items: [listItem({ category_id: 3 })] },
      'GET /api/category': apiError(500, 'boom'),
    })
    renderWithProviders(<BoardPage />)
    expect(await screen.findByText('Nice app')).toBeVisible()
  })
})
