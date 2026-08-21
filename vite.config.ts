import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.BASE_PATH ?? (process.env.GITHUB_ACTIONS ? "/vtm-pwa-charlist/" : "/"),
  plugins: [
    VitePWA({
      injectRegister: "auto",
      manifest: {
        name: "Список персонажей — Вампир: Маскарад",
        short_name: "Персонажи VtM",
        description: "Локальный список персонажей для «Вампир: Маскарад».",
        lang: "ru",
        start_url: ".",
        scope: ".",
        display: "standalone",
        background_color: "#151116",
        theme_color: "#151116",
        icons: [
          {
            src: "icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        navigateFallback: "index.html",
      },
    }),
    react(),
  ],
});
