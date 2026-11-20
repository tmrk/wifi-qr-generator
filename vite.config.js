import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const base = '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'favicon-32.png', 'apple-touch-icon.png'],
      manifest: {
        id: base,
        name: 'Wi-Fi QR Generator',
        short_name: 'Wi-Fi QR',
        description: 'Create a QR code that lets anyone join your Wi-Fi network. Works offline.',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'any',
        theme_color: '#ffffff',
        background_color: '#f4f6fa',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache the shell and every lazy exporter chunk so exports work offline.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        // Pictures for link previews and search results are only fetched by other sites.
        globIgnores: ['og-image.*', 'screenshot.png'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: '/index.html',
        // Files for crawlers and agents must be served as they are, not as the app shell.
        // Matched against the path plus query, so anchor it to the exact file names.
        navigateFallbackDenylist: [
          /^\/(?:llms\.txt|llms-full\.txt|robots\.txt|sitemap\.xml|link-api\.json|og-image\.(?:png|svg)|screenshot\.png)(?:\?.*)?$/,
        ],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
})
