import type { HttpContext } from '@adonisjs/core/http'
import League from '#models/league'
import Team from '#models/team'
import { createTeamValidator, updateTeamValidator } from '#validators/league'

export default class DashboardTeamsController {
  async store({ params, request, response, session }: HttpContext) {
    const league = await League.find(params.leagueId)
    if (!league) {
      session.flash('error', 'Liga no encontrada')
      return response.redirect().toRoute('dashboard.leagues')
    }
    const data = await request.validateUsing(createTeamValidator)
    await Team.create({ leagueId: league.id, name: data.name, logoUrl: data.logoUrl ?? null })
    session.flash('success', 'Equipo agregado')
    return response.redirect().back()
  }

  async update({ params, request, response, session }: HttpContext) {
    const team = await Team.find(params.id)
    if (!team) {
      session.flash('error', 'Equipo no encontrado')
      return response.redirect().back()
    }
    const data = await request.validateUsing(updateTeamValidator)
    team.merge(data)
    await team.save()
    session.flash('success', 'Equipo actualizado')
    return response.redirect().back()
  }

  async destroy({ params, response, session }: HttpContext) {
    const team = await Team.find(params.id)
    if (team) await team.delete()
    session.flash('success', 'Equipo eliminado')
    return response.redirect().back()
  }
}
