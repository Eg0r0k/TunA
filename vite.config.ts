/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "node:path";
import { VitePWA } from "vite-plugin-pwa";
import pkg from "./package.json";
import tailwindcss from "@tailwindcss/vite";

const host = process.env.TAURI_DEV_HOST;
// Set by the Tauri CLI while it runs `beforeBuildCommand` / `beforeDevCommand`
const isTauriBuild = !!process.env.TAURI_ENV_PLATFORM;
const appName = process.env.VITE_PWA_NAME || "TunA";

/**
 * Emits `version.json`, which the web app fetches (bypassing the service
 * worker cache) to show which version an update brings.
 */
const versionManifest = (): Plugin => ({
  name: "tuna:version-manifest",
  apply: "build",
  generateBundle() {
    this.emitFile({
      type: "asset",
      fileName: "version.json",
      source: JSON.stringify({
        version: pkg.version,
        buildTime: new Date().toISOString(),
      }),
    });
  },
});

const getBase = () => {
  if (isTauriBuild) return "/";
  return process.env.NODE_ENV === "production" ? "/TunA/" : "/";
};

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  base: getBase(),

  plugins: [
    vue(),
    tailwindcss(),
    versionManifest(),
    VitePWA({
      // The desktop app is updated by tauri-plugin-updater instead
      disable: isTauriBuild,
      // The user decides when to reload (see src/stores/updateStore.ts)
      registerType: "prompt",
      injectRegister: false,
      includeAssets: ["robots.txt", "icons/*.png"],
      manifest: {
        id: "/TunA/",
        name: appName,
        short_name: appName,
        description:
          "A precise and user-friendly app for tuning your musical instruments.",
        start_url: ".",
        scope: ".",
        theme_color: "#090909",
        background_color: "#090909",
        display: "standalone",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ["**/*.{js,css,html,png,svg,webp,ico}"],
        // version.json must always come from the network
        globIgnores: ["**/version.json", "**/screenshots/**"],
      },
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1600,
  },
  esbuild: {
    // Keep errors and warnings in production, drop debug noise
    pure: ["console.log", "console.debug"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  clearScreen: false,
  server: {
    host: "0.0.0.0",
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
