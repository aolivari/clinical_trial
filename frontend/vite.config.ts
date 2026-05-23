import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Needed for Docker container mapping
    watch: {
      usePolling: true, // Needed for reliable reload inside some VM/containers environments
    }
  }
})
