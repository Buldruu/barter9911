import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base ('./') makes the build work whether it is served from the
// domain root or from a GitHub Pages project sub-path (e.g. /barter9911.mn/).
// Combined with HashRouter this guarantees no white screen and no refresh 404s.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Split heavy vendors into their own chunks for faster first paint.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          firebase: [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
            'firebase/storage',
          ],
          motion: ['framer-motion'],
        },
      },
    },
  },
})
