import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import Space from '#models/space'
import Block from '#models/block'
import Location from '#models/location'
import BookingService from '#services/booking_service'
import { createSpaceValidator, updateSpaceValidator } from '#validators/space'
import { availabilityValidator } from '#validators/booking'
import { createBlockValidator } from '#validators/block'

export default class SpacesController {
  /**
   * GET /spaces — public list, optional ?type, ?maxPrice, ?locationId.
   */
  async index({ request }: HttpContext) {
    const { type, maxPrice, locationId } = request.qs()
    const query = Space.query().preload('location').orderBy('name', 'asc')
    if (type) query.where('type', type)
    if (maxPrice) query.where('price_per_hour', '<=', Number(maxPrice))
    if (locationId) query.where('location_id', locationId)
    return query
  }

  async show({ params, response }: HttpContext) {
    const space = await Space.query().where('id', params.id).preload('location').first()
    if (!space) return response.notFound({ error: 'Space not found' })
    return space
  }

  /**
   * GET /spaces/:id/availability?date=YYYY-MM-DD
   */
  async availability({ params, request, response }: HttpContext) {
    const space = await Space.find(params.id)
    if (!space) return response.notFound({ error: 'Space not found' })
    const { date } = await request.validateUsing(availabilityValidator)
    const occupied = await new BookingService().getOccupiedSlots(space.id, date)
    return { space: { id: space.id, name: space.name, type: space.type, status: space.status }, date, occupied }
  }

  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(createSpaceValidator)
    const location = await Location.find(data.locationId)
    if (!location) return response.unprocessableEntity({ error: 'Location not found' })
    const space = await Space.create(data)
    return response.created(space)
  }

  async update({ params, request, response }: HttpContext) {
    const space = await Space.find(params.id)
    if (!space) return response.notFound({ error: 'Space not found' })
    const data = await request.validateUsing(updateSpaceValidator)
    if (data.locationId) {
      const location = await Location.find(data.locationId)
      if (!location) return response.unprocessableEntity({ error: 'Location not found' })
    }
    space.merge(data)
    await space.save()
    return space
  }

  async destroy({ params, response }: HttpContext) {
    const space = await Space.find(params.id)
    if (!space) return response.notFound({ error: 'Space not found' })
    await space.delete()
    return response.noContent()
  }

  /**
   * POST /admin/spaces/:id/block — admin blocks a time window on a space.
   */
  async block({ params, request, response, auth }: HttpContext) {
    const space = await Space.find(params.id)
    if (!space) return response.notFound({ error: 'Space not found' })
    const data = await request.validateUsing(createBlockValidator)
    const service = new BookingService()
    if (service.toMinutes(data.endTime) <= service.toMinutes(data.startTime)) {
      return response.unprocessableEntity({ error: 'endTime must be after startTime' })
    }
    const block = await Block.create({
      spaceId: space.id,
      createdBy: auth.user!.id,
      date: DateTime.fromISO(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      reason: data.reason ?? null,
    })
    return response.created(block)
  }
}
