import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { pmMode } from '../pm/pmStore'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  pmMode.exit()
  localStorage.clear()
})
