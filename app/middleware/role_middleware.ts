import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Role middleware restricts a route to users with a given role.
 * Must run AFTER the auth middleware so `ctx.auth.user` is populated.
 *
 *   .use([middleware.auth({ guards: ['api'] }), middleware.role({ role: 'admin' })])
 */
export default class RoleMiddleware {
  async handle(ctx: HttpContext, next: NextFn, options: { role: 'admin' | 'user' }) {
    const user = ctx.auth.user
    if (!user || user.role !== options.role) {
      return ctx.response.forbidden({ error: `Forbidden: requires "${options.role}" role` })
    }
    return next()
  }
}
