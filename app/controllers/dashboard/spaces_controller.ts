import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import Space from '#models/space'
import Block from '#models/block'
import Location from '#models/location'
import { createSpaceValidator, updateSpaceValidator } from '#validators/space'
import { createBlockValidator } from '#validators/block'

export default class DashboardSpacesController {
  async index({ inertia }: HttpContext) {
    const spaces = await Space.query().preload('location').withCount('bookings').orderBy('name', 'asc')
    const locations = await Location.query().orderBy('name', 'asc')

    return inertia.render('dashboard/spaces', {
      spaces: spaces.map((s) => ({
        id: s.id,
        name: s.name,
        locationId: s.locationId,
        locationName: s.location?.name ?? '—',
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
      locations: locations.map((l) => ({ id: l.id, name: l.name })),
    })
  }

  async store({ request, response, session }: HttpContext) {
    const data = await request.validateUsing(createSpaceValidator)
    const location = await Location.find(data.locationId)
    if (!location) {
      session.flash('error', 'Locación no encontrada')
      return response.redirect().back()
    }
    await Space.create(data)
    session.flash('success', 'Espacio creado')
    return response.redirect().back()
  }

  async update({ params, request, response, session }: HttpContext) {
    const space = await Space.find(params.id)
    if (!space) {
      session.flash('error', 'Espacio no encontrado')
      return response.redirect().back()
    }
    const data = await request.validateUsing(updateSpaceValidator)
    if (data.locationId) {
      const location = await Location.find(data.locationId)
      if (!location) {
        session.flash('error', 'Locación no encontrada')
        return response.redirect().back()
      }
    }
    space.merge(data)
    await space.save()
    session.flash('success', 'Espacio actualizado')
    return response.redirect().back()
  }

  async destroy({ params, response, session }: HttpContext) {
    const space = await Space.find(params.id)
    if (space) await space.delete()
    session.flash('success', 'Espacio eliminado')
    return response.redirect().back()
  }

  async block({ params, request, response, auth, session }: HttpContext) {
    const space = await Space.find(params.id)
    if (!space) {
      session.flash('error', 'Espacio no encontrado')
      return response.redirect().back()
    }
    const data = await request.validateUsing(createBlockValidator)
    await Block.create({
      spaceId: space.id,
      createdBy: auth.user!.id,
      date: DateTime.fromISO(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      reason: data.reason ?? null,
    })
    session.flash('success', `Bloqueo agregado a ${space.name}`)
    return response.redirect().back()
  }
}
