import type { HttpContext } from '@adonisjs/core/http'
import Team from '#models/team'
import Player from '#models/player'
import { createPlayerValidator, updatePlayerValidator } from '#validators/league'

export default class DashboardPlayersController {
  async store({ params, request, response, session }: HttpContext) {
    const team = await Team.find(params.teamId)
    if (!team) {
      session.flash('error', 'Equipo no encontrado')
      return response.redirect().back()
    }
    const data = await request.validateUsing(createPlayerValidator)
    await Player.create({ teamId: team.id, name: data.name, number: data.number ?? null })
    session.flash('success', 'Jugador agregado')
    return response.redirect().back()
  }

  async update({ params, request, response, session }: HttpContext) {
    const player = await Player.find(params.id)
    if (!player) {
      session.flash('error', 'Jugador no encontrado')
      return response.redirect().back()
    }
    const data = await request.validateUsing(updatePlayerValidator)
    player.merge(data)
    await player.save()
    session.flash('success', 'Jugador actualizado')
    return response.redirect().back()
  }

  async destroy({ params, response, session }: HttpContext) {
    const player = await Player.find(params.id)
    if (player) await player.delete()
    session.flash('success', 'Jugador eliminado')
    return response.redirect().back()
  }
}
