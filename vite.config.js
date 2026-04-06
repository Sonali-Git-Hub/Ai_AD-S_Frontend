import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  envPrefix: ["AISA_", "VITE_"],
  server: {
    host: true,
    allowedHosts: true, // required for Vite 6+ to work with ngrok
  },
  build: {
    outDir: "dist",
    reportCompressedSize: false,
    minify: false
  }
})
