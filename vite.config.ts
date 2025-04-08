import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/app/",  // Ensure React assets are loaded correctly
  build: {
    outDir: "dist",
  },
  server: {
    port: 3001,
    strictPort: true,
  }
})
