import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api, call, pmApi } from './client'
import { ApiError } from './errors'
import { clearPmKey, setPmKey } from './pmKey'

function stubFetch(response: Response | Error) {
  const fetch = vi.fn<(request: Request) => Promise<Response>>(() =>
    response instanceof Error
      ? Promise.reject(response)
      : Promise.resolve(response),
  )
  vi.stubGlobal('fetch', fetch)
  return fetch
}

const postFeedback = () =>
  call(api.POST('/api/feedback', { body: { rating: 5, note: 'Great' } }))

const putStatus = () =>
  call(
    pmApi.PUT('/api/feedback/{feedback_id}/status', {
      params: { path: { feedback_id: 7 } },
      body: { status: 'closed_solved' },
    }),
  )

describe('call', () => {
  it('returns the data of a successful response', async () => {
    const feedback = {
      id: 1,
      rating: 5,
      note: 'Great',
      status: 'open',
      category_id: null,
      merged_into_id: null,
    }
    stubFetch(Response.json(feedback, { status: 201 }))
    await expect(postFeedback()).resolves.toEqual(feedback)
  })

  it("AC-4: rejects with the API's error message", async () => {
    stubFetch(
      Response.json(
        {
          error: {
            code: 422,
            message: 'note: String should have at most 20000 characters',
          },
        },
        { status: 422 },
      ),
    )
    await expect(postFeedback()).rejects.toEqual(
      new ApiError(422, 'note: String should have at most 20000 characters'),
    )
  })

  it('AC-5: rejects with a readable message for a non-JSON error page', async () => {
    stubFetch(new Response('<h1>Bad Gateway</h1>', { status: 502 }))
    const error = await postFeedback().catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 502,
      message: 'The API is unavailable right now. Try again later.',
    })
  })

  it('AC-6: rejects with status 0 when the network fails', async () => {
    stubFetch(new TypeError('Failed to fetch'))
    await expect(postFeedback()).rejects.toEqual(
      new ApiError(0, 'Cannot reach the API.'),
    )
  })
})

describe('PM key header', () => {
  beforeEach(() => clearPmKey())
  afterEach(() => clearPmKey())

  it('AC-7: pmApi sends the stored key as a bearer token', async () => {
    setPmKey('s3cret')
    const fetch = stubFetch(Response.json({}, { status: 200 }))
    await putStatus()
    expect(fetch.mock.calls[0][0].headers.get('Authorization')).toBe(
      'Bearer s3cret',
    )
  })

  it('AC-7: api never sends the key', async () => {
    setPmKey('s3cret')
    const fetch = stubFetch(Response.json({}, { status: 201 }))
    await postFeedback()
    expect(fetch.mock.calls[0][0].headers.has('Authorization')).toBe(false)
  })

  it('AC-8: pmApi does not send a request without a key', async () => {
    const fetch = stubFetch(Response.json({}, { status: 200 }))
    await expect(putStatus()).rejects.toEqual(
      new ApiError(401, 'Enter the PM key first.'),
    )
    expect(fetch).not.toHaveBeenCalled()
  })

  it('AC-9: the key never appears in errors or console output', async () => {
    setPmKey('s3cret')
    const log = vi.spyOn(console, 'log')
    const warn = vi.spyOn(console, 'warn')
    const consoleError = vi.spyOn(console, 'error')
    stubFetch(
      Response.json(
        { error: { code: 401, message: 'Invalid PM key' } },
        { status: 401 },
      ),
    )
    const error = await putStatus().catch((e: unknown) => e)
    expect(String((error as Error).message)).not.toContain('s3cret')
    for (const spy of [log, warn, consoleError]) {
      expect(JSON.stringify(spy.mock.calls)).not.toContain('s3cret')
    }
    vi.restoreAllMocks()
  })
})
