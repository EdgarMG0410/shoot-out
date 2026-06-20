/// <reference path="../../adonisrc.ts" />
/// <reference path="../../config/inertia.ts" />
/// <reference path="../../config/auth.ts" />

import '../css/app.css'
import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { Loader } from '~/components/loader'

const appName = import.meta.env.VITE_APP_NAME || 'Futhub'

createInertiaApp({
  progress: { color: '#00E676', delay: 120 },

  title: (title) => (title ? `${title} · ${appName}` : appName),

  resolve: (name) => {
    // `as any`: @adonisjs/inertia's helper return type is looser than
    // @inertiajs/react v2's ComponentResolver — cosmetic, runtime is correct.
    return resolvePageComponent(
      `../pages/${name}.tsx`,
      import.meta.glob('../pages/**/*.tsx')
    ) as any
  },

  setup({ el, App, props }) {
    createRoot(el).render(
      <>
        <App {...props} />
        <Loader />
      </>
    )
  },
})
