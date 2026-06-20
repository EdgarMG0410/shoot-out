import type { HttpContext } from '@adonisjs/core/http'
import Lead from '#models/lead'

/** Solicitudes — landing leads (interested players & court owners). */
export default class LeadsController {
  async index({ inertia }: HttpContext) {
    const leads = await Lead.query().orderBy('created_at', 'desc')

    return inertia.render('dashboard/solicitudes', {
      leads: leads.map((l) => ({
        id: l.id,
        name: l.name,
        email: l.email,
        phone: l.phone,
        type: l.type,
        contactMedium: l.contactMedium,
        message: l.message,
        createdAt: l.createdAt?.toISO() ?? '',
      })),
      counts: {
        total: leads.length,
        jugador: leads.filter((l) => l.type === 'jugador').length,
        cancha: leads.filter((l) => l.type === 'cancha').length,
      },
    })
  }
}
