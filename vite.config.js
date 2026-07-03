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
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: "autoUpdate",
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      },
      manifest: false,
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
