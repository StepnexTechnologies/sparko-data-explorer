import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Set the development server port to 3000
    strictPort: true, // Fail if port 3000 is not available
    proxy: {
      "/api": {
        target: "https://spark-scraper-api.sparkonomy.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    sourcemap: false,
  },
})

