import type { HttpContext } from '@adonisjs/core/http'
import Location from '#models/location'
import { createLocationValidator, updateLocationValidator } from '#validators/location'

export default class DashboardLocationsController {
  async index({ inertia }: HttpContext) {
    const locations = await Location.query()
      .preload('spaces', (q) => q.orderBy('name'))
      .orderBy('name')

    return inertia.render('dashboard/locations', {
      locations: locations.map((l) => ({
        id: l.id,
        name: l.name,
        address: l.address,
        phone: l.phone,
        status: l.status,
        spaces: l.spaces.map((s) => ({
          id: s.id,
          name: s.name,
          type: s.type,
          size: s.size,
          status: s.status,
        })),
      })),
    })
  }

  async edit({ params, inertia, response, session }: HttpContext) {
    const location = await Location.query()
      .where('id', params.id)
      .preload('spaces', (q) => q.withCount('bookings').orderBy('name'))
      .first()

    if (!location) {
      session.flash('error', 'Locación no encontrada')
      return response.redirect().toRoute('dashboard.locations')
    }

    return inertia.render('dashboard/location_edit', {
      location: {
        id: location.id,
        name: location.name,
        address: location.address,
        phone: location.phone,
        photoUrl: location.photoUrl,
        status: location.status,
      },
      spaces: location.spaces.map((s) => ({
        id: s.id,
        name: s.name,
        locationId: s.locationId,
        locationName: location.name,
        type: s.type,
        size: s.size,
        pricePerHour: s.pricePerHour,
        capacity: s.capacity,
        photoUrl: s.photoUrl,
        openTime: s.openTime,
        closeTime: s.closeTime,
        status: s.status,
        bookingsCount: Number(s.$extras.bookings_count ?? 0),
      })),
    })
  }

  async store({ request, response, session }: HttpContext) {
    const data = await request.validateUsing(createLocationValidator)
    await Location.create(data)
    session.flash('success', 'Locación creada')
    return response.redirect().toRoute('dashboard.locations')
  }

  async update({ params, request, response, session }: HttpContext) {
    const location = await Location.find(params.id)
    if (!location) {
      session.flash('error', 'Locación no encontrada')
      return response.redirect().toRoute('dashboard.locations')
    }
    const data = await request.validateUsing(updateLocationValidator)
    location.merge(data)
    await location.save()
    session.flash('success', 'Locación actualizada')
    return response.redirect().back()
  }

  async destroy({ params, response, session }: HttpContext) {
    const location = await Location.find(params.id)
    if (location) await location.delete()
    session.flash('success', 'Locación eliminada')
    return response.redirect().toRoute('dashboard.locations')
  }
}
