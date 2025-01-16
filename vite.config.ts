import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/wireguard/' : '/',
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'https://gonholfol.github.io/wireguard',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
    },
  },
});
