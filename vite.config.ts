/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  if (mode !== 'test' && !env.VITE_API_URL) {
    throw new Error(
      `VITE_API_URL is not set for mode "${mode}". Set it in .env.${mode} or the environment (see .env.example).`,
    )
  }

  return {
    // GitHub Pages serves the site from /<repo-name>/; a Render static site
    // sets BASE_PATH=/ (spec 011).
    base: process.env.BASE_PATH ?? '/smartflow-ui/',
    plugins: [react(), tailwindcss()],
    server: {
      // The API does not send CORS headers yet, so in development the browser
      // calls /api on this server and Vite forwards it to the API (spec 001).
      proxy: {
        '/api': { target: env.VITE_API_URL, changeOrigin: true },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      env: { VITE_API_URL: 'http://api.test' },
    },
  }
})
