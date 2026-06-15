import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import Location from '#models/location'
import EventService, { EventError } from '#services/event_service'
import { eventValidator } from '#validators/event'

export default class DashboardEventsController {
  async index({ inertia }: HttpContext) {
    const events = await Event.query()
      .preload('location')
      .preload('space')
      .orderBy('date', 'desc')
      .orderBy('start_time', 'asc')

    const locations = await Location.query()
      .preload('spaces', (q) => q.orderBy('name'))
      .orderBy('name')

    return inertia.render('dashboard/events', {
      events: events.map((e) => ({
        id: e.id,
        name: e.name,
        description: e.description,
        date: e.date?.toISODate() ?? '',
        startTime: e.startTime,
        endTime: e.endTime,
        capacity: e.capacity,
        price: e.price,
        status: e.status,
        location: e.location?.name ?? '—',
        locationId: e.locationId,
        spaceId: e.spaceId,
        venue: e.space?.name ?? '—',
      })),
      locations: locations.map((l) => ({
        id: l.id,
        name: l.name,
        spaces: l.spaces.map((s) => ({ id: s.id, name: s.name, type: s.type })),
      })),
    })
  }

  async store({ request, response, session }: HttpContext) {
    const data = await request.validateUsing(eventValidator)
    try {
      await new EventService().createEvent(data)
      session.flash('success', 'Evento creado')
    } catch (error) {
      if (error instanceof EventError) session.flash('error', error.message)
      else throw error
    }
    return response.redirect().toRoute('dashboard.events')
  }

  async update({ params, request, response, session }: HttpContext) {
    const event = await Event.find(params.id)
    if (!event) {
      session.flash('error', 'Evento no encontrado')
      return response.redirect().toRoute('dashboard.events')
    }
    const data = await request.validateUsing(eventValidator)
    try {
      await new EventService().updateEvent(event, data)
      session.flash('success', 'Evento actualizado')
    } catch (error) {
      if (error instanceof EventError) session.flash('error', error.message)
      else throw error
    }
    return response.redirect().toRoute('dashboard.events')
  }

  async destroy({ params, response, session }: HttpContext) {
    const event = await Event.find(params.id)
    if (event) await event.delete()
    session.flash('success', 'Evento eliminado')
    return response.redirect().toRoute('dashboard.events')
  }
}
