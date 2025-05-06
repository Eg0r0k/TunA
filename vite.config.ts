import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "node:path";
import { VitePWA } from "vite-plugin-pwa";
import pkg from "./package.json";
import tailwindcss from "@tailwindcss/vite";
const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  base: process.env.NODE_ENV === "production" ? "/TunA/" : "/",

  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "icons/*.png"],
      // devOptions: {
      //   enabled: false,
      // },
      injectRegister: "auto",
      manifest: {
        name: process.env.VITE_PWA_NAME,
        short_name: process.env.VITE_PWA_NAME,
        theme_color: "#090909",
        background_color: "#090909",

        display: "standalone",
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    sourcemap: false,
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: false,
      },
    },
    chunkSizeWarningLimit: 1600,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1420,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
}));
