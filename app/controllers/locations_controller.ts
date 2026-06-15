import type { HttpContext } from '@adonisjs/core/http'
import Location from '#models/location'
import { createLocationValidator, updateLocationValidator } from '#validators/location'

export default class LocationsController {
  /**
   * GET /locations — public list with spaces, optional ?status.
   */
  async index({ request }: HttpContext) {
    const { status } = request.qs()
    const query = Location.query().preload('spaces').orderBy('name', 'asc')
    if (status) query.where('status', status)
    return query
  }

  async show({ params, response }: HttpContext) {
    const location = await Location.query().where('id', params.id).preload('spaces').first()
    if (!location) return response.notFound({ error: 'Location not found' })
    return location
  }

  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(createLocationValidator)
    const location = await Location.create(data)
    return response.created(location)
  }

  async update({ params, request, response }: HttpContext) {
    const location = await Location.find(params.id)
    if (!location) return response.notFound({ error: 'Location not found' })
    const data = await request.validateUsing(updateLocationValidator)
    location.merge(data)
    await location.save()
    return location
  }

  async destroy({ params, response }: HttpContext) {
    const location = await Location.find(params.id)
    if (!location) return response.notFound({ error: 'Location not found' })
    await location.delete()
    return response.noContent()
  }
}
