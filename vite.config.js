import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Spydus-Cataloguing-Assistant/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})