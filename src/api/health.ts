import { api, call } from './client'

export function fetchHealth() {
  return call(api.GET('/api/health'))
}
