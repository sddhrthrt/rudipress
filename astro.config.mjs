// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
// Note: No adapter needed for static sites on Cloudflare Pages
export default defineConfig({
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
