import { randomUUID } from 'node:crypto'
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { accessValidator, loginValidator, registerValidator } from '#validators/auth'

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

  /**
   * Passwordless renter access: identified only by email. Finds or creates the
   * user (role 'user') and logs them in. No password is ever asked — a random
   * one is stored to satisfy the column. Used by the public site's "entrar".
   */
  async access({ request, response, auth, session }: HttpContext) {
    const { email, fullName } = await request.validateUsing(accessValidator)

    // Admin accounts must use the password login — never passwordless.
    const existing = await User.findBy('email', email)
    if (existing?.role === 'admin') {
      session.flash('error', 'Esta cuenta es de administrador. Inicia sesión con tu contraseña.')
      return response.redirect().toPath('/auth/login')
    }

    const user =
      existing ??
      (await User.create({
        email,
        fullName: fullName ?? null,
        role: 'user',
        renterType: 'particular',
        password: randomUUID() + randomUUID(),
      }))

    // Keep a name if the renter provided one and we didn't have it yet.
    if (fullName && !user.fullName) {
      user.fullName = fullName
      await user.save()
    }

    await auth.use('web').login(user)
    session.flash('success', `¡Hola${user.fullName ? ` ${user.fullName}` : ''}!`)
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
