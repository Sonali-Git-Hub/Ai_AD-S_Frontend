import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  envPrefix: ["AISA_", "VITE_"],
  // build: {
  //   outDir: "dist"
  // }
  // server: {
  //   host: true,
  //   allowedHosts: true,   // <-- final fix
  //   cors: true
  // }
})
