import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import EventService, { EventError } from '#services/event_service'
import { eventValidator } from '#validators/event'

export default class EventsController {
  /**
   * GET /events — public list, filters: ?locationId, ?spaceId, ?date, ?status.
   */
  async index({ request }: HttpContext) {
    const { locationId, spaceId, date, status } = request.qs()
    const query = Event.query()
      .preload('location')
      .preload('space')
      .orderBy('date', 'desc')
      .orderBy('start_time', 'asc')

    if (locationId) query.where('location_id', locationId)
    if (spaceId) query.where('space_id', spaceId)
    if (date) query.where('date', date)
    if (status) query.where('status', status)

    return query
  }

  async show({ params, response }: HttpContext) {
    const event = await Event.query().where('id', params.id).preload('location').preload('space').first()
    if (!event) return response.notFound({ error: 'Event not found' })
    return event
  }

  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(eventValidator)
    try {
      const event = await new EventService().createEvent(data)
      return response.created(event)
    } catch (error) {
      if (error instanceof EventError) {
        return response.status(error.status ?? 400).send({ error: error.message, code: error.code })
      }
      throw error
    }
  }

  async update({ params, request, response }: HttpContext) {
    const event = await Event.find(params.id)
    if (!event) return response.notFound({ error: 'Event not found' })
    const data = await request.validateUsing(eventValidator)
    try {
      return await new EventService().updateEvent(event, data)
    } catch (error) {
      if (error instanceof EventError) {
        return response.status(error.status ?? 400).send({ error: error.message, code: error.code })
      }
      throw error
    }
  }

  async destroy({ params, response }: HttpContext) {
    const event = await Event.find(params.id)
    if (!event) return response.notFound({ error: 'Event not found' })
    await event.delete()
    return response.noContent()
  }
}
