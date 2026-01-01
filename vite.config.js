import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8000,
    headers: {
      // Required for Firebase Auth popup to work properly
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
})
