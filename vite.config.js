import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/wifi-qr-generator/',
  plugins: [react()],
})
