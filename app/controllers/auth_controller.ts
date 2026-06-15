import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { registerValidator, loginValidator } from '#validators/auth'

/**
 * API auth (mobile app) backed by the `api` access-tokens guard.
 * register/login mint a bearer token; the plaintext token is only ever
 * returned here, right after creation.
 */
export default class AuthController {
  async register({ request, response }: HttpContext) {
    const data = await request.validateUsing(registerValidator)
    // Public registration always creates a plain user; admins are seeded/managed.
    const user = await User.create({ ...data, role: 'user' })
    const token = await User.accessTokens.create(user)
    return response.created({ user, token })
  }

  async login({ request }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const user = await User.verifyCredentials(email, password)
    const token = await User.accessTokens.create(user)
    return { user, token }
  }

  async logout({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    return response.ok({ message: 'Logged out' })
  }

  async me({ auth }: HttpContext) {
    return auth.getUserOrFail()
  }
}
