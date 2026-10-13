import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { apiError, mockApi } from '../test/mockApi'
import { renderWithProviders } from '../test/render'
import { NewFeedbackForm } from './NewFeedbackForm'

const created = {
  id: 9,
  rating: 4,
  note: null,
  status: 'open',
  category_id: null,
  merged_into_id: null,
}

describe('NewFeedbackForm', () => {
  it('AC-1, AC-2: requires a rating from the star radio group', async () => {
    const fetch = mockApi({})
    renderWithProviders(<NewFeedbackForm />)
    expect(screen.getAllByRole('radio')).toHaveLength(5)
    await userEvent.click(screen.getByRole('button', { name: 'Post feedback' }))
    expect(screen.getByText('Choose a rating.')).toBeVisible()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('AC-3, AC-4: sends the rating and trimmed note, then resets', async () => {
    const fetch = mockApi({
      'POST /api/feedback': () => Response.json(created, { status: 201 }),
    })
    renderWithProviders(<NewFeedbackForm />)
    await userEvent.click(screen.getByRole('radio', { name: '4 stars' }))
    await userEvent.type(screen.getByLabelText(/Note/), '  Fast!  ')
    await userEvent.click(screen.getByRole('button', { name: 'Post feedback' }))

    expect(await screen.findByText('Thanks for your feedback!')).toBeVisible()
    expect(await fetch.mock.calls[0][0].json()).toEqual({
      rating: 4,
      note: 'Fast!',
    })
    expect(screen.getByLabelText(/Note/)).toHaveValue('')
    expect(screen.getByRole('radio', { name: '4 stars' })).not.toBeChecked()
  })

  it('AC-3: leaves out an empty note', async () => {
    const fetch = mockApi({
      'POST /api/feedback': () => Response.json(created, { status: 201 }),
    })
    renderWithProviders(<NewFeedbackForm />)
    await userEvent.click(screen.getByRole('radio', { name: '1 star' }))
    await userEvent.type(screen.getByLabelText(/Note/), '   ')
    await userEvent.click(screen.getByRole('button', { name: 'Post feedback' }))
    await screen.findByText('Thanks for your feedback!')
    expect(await fetch.mock.calls[0][0].json()).toEqual({ rating: 1 })
  })

  it('AC-5: shows the API error and keeps the input', async () => {
    mockApi({
      'POST /api/feedback': apiError(422, 'note: too long'),
    })
    renderWithProviders(<NewFeedbackForm />)
    await userEvent.click(screen.getByRole('radio', { name: '5 stars' }))
    await userEvent.type(screen.getByLabelText(/Note/), 'Keep me')
    await userEvent.click(screen.getByRole('button', { name: 'Post feedback' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('note: too long')
    expect(screen.getByLabelText(/Note/)).toHaveValue('Keep me')
    expect(screen.getByRole('radio', { name: '5 stars' })).toBeChecked()
  })

  it('AC-6: limits the note to 20 000 characters', () => {
    mockApi({})
    renderWithProviders(<NewFeedbackForm />)
    expect(screen.getByLabelText(/Note/)).toHaveAttribute('maxLength', '20000')
  })
})
