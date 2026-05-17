import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,gif,webp,jpg,jpeg,woff,woff2}'],
        importScripts: ['push-sw.js'],
      },
      manifest: {
        name: 'shm mood tracker',
        short_name: 'shm mood',
        description: 'Track your mood every day',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/shm-mood-tracker/',
        start_url: '/shm-mood-tracker/',
        icons: [
          {
            src: 'images/mail.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  base: '/shm-mood-tracker/',
});
