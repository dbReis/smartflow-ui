import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ApiError } from '../api/errors'
import { ErrorMessage } from './ErrorMessage'

describe('ErrorMessage', () => {
  it("AC-11: shows an ApiError's message in an alert", () => {
    render(<ErrorMessage error={new ApiError(404, 'Feedback 7 not found')} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Feedback 7 not found')
  })

  it('AC-11: shows a generic message for other errors', () => {
    render(<ErrorMessage error={new TypeError('x is undefined')} />)
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Something went wrong. Please try again.',
    )
  })
})
