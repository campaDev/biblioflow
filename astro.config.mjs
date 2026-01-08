// @ts-check
import { defineConfig } from "astro/config";

import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";

import sitemap from "@astrojs/sitemap";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  integrations: [svelte(), sitemap()],

  // Importante para que genere el sitemap
  site: "https://biblioflow.com.py",

  vite: {
    plugins: [tailwindcss()],
  },

  image: {
    domains: ["suiwgpmfcebvjstjaxhw.supabase.co"], // <--- Reemplaza con TU dominio de Supabase
    // O si prefieres usar remotePatterns para ser más específico:
    /* remotePatterns: [{ protocol: 'https', hostname: '**.supabase.co' }]
     */
  },

  adapter: node({
    mode: "standalone",
  }),
});