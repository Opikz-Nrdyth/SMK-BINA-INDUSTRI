import { defineConfig } from 'vite'
import { getDirname } from '@adonisjs/core/helpers'
import inertia from '@adonisjs/inertia/client'
import react from '@vitejs/plugin-react'
import adonisjs from '@adonisjs/vite/client'

export default defineConfig({
  plugins: [
    inertia({ ssr: { enabled: false } }),
    react(),
    adonisjs({ entrypoints: ['inertia/app/app.tsx'], reload: ['resources/views/**/*.edge'] }),
  ],

  server: {
    allowedHosts: ['smksbinaindustri.opikstudio.my.id'],
    host: '0.0.0.0',
    port: 2052,
    cors: true,
    hmr: {
      host: 'smksbinaindustri.opikstudio.my.id',
      protocol: 'wss',
    },
  },

  resolve: {
    alias: {
      '~/': `${getDirname(import.meta.url)}/inertia/`,
    },
  },
})
