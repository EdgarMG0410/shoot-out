import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { loginValidator, registerValidator } from '#validators/auth'

const homeFor = (user: User) => (user.role === 'admin' ? '/dashboard' : '/app')

/**
 * Web (session) auth shared by admins (→ /dashboard) and clients (→ /app).
 */
export default class SessionController {
  async showLogin({ inertia }: HttpContext) {
    return inertia.render('auth/login')
  }

  async login({ request, response, auth, session }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    let user: User
    try {
      user = await User.verifyCredentials(email, password)
    } catch {
      session.flash('error', 'Correo o contraseña inválidos')
      return response.redirect().back()
    }

    await auth.use('web').login(user)
    return response.redirect().toPath(homeFor(user))
  }

  async showRegister({ inertia }: HttpContext) {
    return inertia.render('auth/register')
  }

  async register({ request, response, auth }: HttpContext) {
    const data = await request.validateUsing(registerValidator)
    const user = await User.create({ ...data, role: 'user' })
    await auth.use('web').login(user)
    return response.redirect().toPath('/app')
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect().toPath('/auth/login')
  }
}
