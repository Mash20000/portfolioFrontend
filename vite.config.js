import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Hostnames allowed to reach the dev server through a tunnel. A leading dot also allows subdomains.
    allowedHosts: [".ngrok-free.dev", ".ngrok-free.app", ".ngrok.io", ".ngrok.app", ".trycloudflare.com"],
    // Forwards /api calls to the Express server. With VITE_API_URL=/api, a phone (or anyone) opening the
    // site through ONE tunnel to port 5173 reaches the API too: no second tunnel, no CORS.
    proxy: {
      "/api": { target: "http://localhost:5000", changeOrigin: true },
      "/sitemap.xml": { target: "http://localhost:5000", changeOrigin: true },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          motion: ["framer-motion"],
          charts: ["recharts"],
        },
      },
    },
  },
});