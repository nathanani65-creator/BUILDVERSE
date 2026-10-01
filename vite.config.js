import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// base: './' lets the built game run from any folder (e.g. GitHub Pages or a USB drive)
export default defineConfig({
  plugins: [vue()],
  base: './'
})
