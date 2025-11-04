/// <reference path="../../adonisrc.ts" />
/// <reference path="../../config/inertia.ts" />

import '../css/app.css'
import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { NotificationProvider } from '~/Components/NotificationAlert'

const appName = import.meta.env.VITE_APP_NAME || 'SMK BINA INDUSTRI'

createInertiaApp({
  progress: { color: '#5468FF' },

  title: (title) => `${title} ${title && '-'} ${appName}`,

  resolve: (name) => {
    return resolvePageComponent(`../pages/${name}.tsx`, import.meta.glob('../pages/**/*.tsx'))
  },

  setup({ el, App, props }) {
    createRoot(el).render(
      <NotificationProvider>
        <App {...props} />
      </NotificationProvider>
    )
  },
})
