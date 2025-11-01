import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  base: '/VentoPOS/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'Minisúper El Ventolero',
        short_name: 'Ventolero',
        description: 'Catálogo y POS para Minisúper El Ventolero',
        theme_color: '#0ea5e9',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    host: '0.0.0.0', // Permite conexiones desde cualquier IP
    port: 5173,
    middlewareMode: false,
    configure: (app) => {
      // Servir el catálogo estático en /catalogo
      app.get('/catalogo', (req, res) => {
        try {
          const catalogHtml = readFileSync(resolve(__dirname, 'public/catalogo.html'), 'utf-8')
          res.setHeader('Content-Type', 'text/html')
          res.send(catalogHtml)
        } catch (error) {
          res.status(404).send('Catálogo no encontrado')
        }
      })
    }
  }
})