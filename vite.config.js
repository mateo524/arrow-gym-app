import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const isNative = process.env.BUILD_TARGET === "native";

export default defineConfig({
  base: "/",
  plugins: [
    react(),
    // PWA solo en builds web (no nativo)
    !isNative && VitePWA({
      registerType: "autoUpdate",
      // El plugin genera el SW automáticamente con precache de todos los assets
      workbox: {
        // Precachea todos los assets del build
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // SPA: cualquier ruta que no sea un asset cae en index.html
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: { cacheName: "google-fonts" },
          },
        ],
        // Limpia caches viejas automáticamente
        cleanupOutdatedCaches: true,
      },
      // Usa el manifest.json que ya existe en /public
      manifest: false,
      // No inyectar el manifest en el HTML (ya está como link en index.html)
      injectRegister: "auto",
    }),
  ].filter(Boolean),
  build: {
    outDir: isNative ? "dist-native" : "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-icons": ["lucide-react"],
          "vendor-state": ["zustand"],
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});
