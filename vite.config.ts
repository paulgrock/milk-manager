/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue(),
    ui({
      ui: {
        colors: { primary: 'green', neutral: 'stone' },
      },
      // Build every icon the app uses into the bundle (from @iconify-json/lucide),
      // so they show in the barn with no signal instead of loading from the
      // Iconify API. .ts files too: the navigation list names its icons there.
      icon: {
        clientBundle: {
          scan: { globInclude: ['src/**/*.{vue,ts}'] },
        },
      },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Milk Manager',
        short_name: 'Milk Manager',
        description: 'Dairy goat herd, milk and breeding records',
        theme_color: '#15803d',
        background_color: '#fbfae6',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
      },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['src/**/*.test.ts'],
    passWithNoTests: true,
  },
})
