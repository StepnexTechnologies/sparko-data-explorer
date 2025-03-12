import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000, // Set the development server port to 3000
        strictPort: true, // Fail if port 3000 is not available
        proxy: {
            "/api": {
                target: "https://spark-scraper-api.sparkonomy.com",
                changeOrigin: true,
                rewrite: function (path) { return path.replace(/^\/api/, ""); },
                secure: false, // Accept self-signed certificates
                configure: function (proxy) {
                    proxy.on('error', function (err) {
                        console.log('proxy error', err);
                    });
                    proxy.on('proxyReq', function (_, req) {
                        console.log('Sending Request to the Target:', req.method, req.url);
                    });
                    proxy.on('proxyRes', function (proxyRes, req) {
                        console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
                    });
                },
            },
        },
    },
    build: {
        sourcemap: false,
    },
});
