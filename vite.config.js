// AISA Frontend - Vite Configuration (Sync: 2026-04-30)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  envPrefix: ["AISA_", "VITE_"],
  server: {
    host: true, // Listen on all network interfaces
    allowedHosts: true, // Allow ngrok URLs to bypass host checks in Vite 6
  },
  build: {
    outDir: "dist",
    reportCompressedSize: false,
    minify: false
  }
})
