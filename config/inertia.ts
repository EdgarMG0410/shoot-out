import { defineConfig } from '@adonisjs/inertia'
import type { InferSharedProps } from '@adonisjs/inertia/types'

const inertiaConfig = defineConfig({
  /**
   * Path to the Edge view that will be used as the root view for Inertia responses
   */
  rootView: 'inertia_layout',

  /**
   * Data shared with every rendered page (auth user + flash messages).
   */
  sharedData: {
    user: (ctx) => {
      const user = ctx.auth?.user
      return user
        ? { id: user.id, fullName: user.fullName, email: user.email, role: user.role }
        : null
    },
    flash: (ctx) => ({
      success: ctx.session?.flashMessages.get('success') ?? null,
      error: ctx.session?.flashMessages.get('error') ?? null,
    }),
    errors: (ctx) => ctx.session?.flashMessages.get('errors') ?? {},
  },

  /**
   * Options for the server-side rendering
   */
  ssr: {
    enabled: false,
    entrypoint: 'inertia/app/ssr.tsx',
  },
})

export default inertiaConfig

declare module '@adonisjs/inertia/types' {
  export interface SharedProps extends InferSharedProps<typeof inertiaConfig> {}
}
