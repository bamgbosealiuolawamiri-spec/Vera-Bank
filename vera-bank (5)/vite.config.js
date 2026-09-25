import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config for VERA Bank
// base is relative so the built app works when opened from any static host / subfolder
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { host: '127.0.0.1', port: 5173 },
})
