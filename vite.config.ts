import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/wireguard-web-ui/' : '/',
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'https://api.github.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
