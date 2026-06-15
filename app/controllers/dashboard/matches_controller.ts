import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import League from '#models/league'
import Team from '#models/team'
import Player from '#models/player'
import Space from '#models/space'
import Match from '#models/match'
import MatchEvent from '#models/match_event'
import BookingService from '#services/booking_service'
import { createMatchValidator, updateMatchValidator, createMatchEventValidator } from '#validators/match'

export default class DashboardMatchesController {
  /** Both team ids must belong to the given league. */
  private async teamsBelong(leagueId: number, ...ids: number[]) {
    const count = await Team.query().where('league_id', leagueId).whereIn('id', ids).count('* as c').first()
    return Number(count?.$extras.c ?? 0) === new Set(ids).size
  }

  async store({ params, request, response, session }: HttpContext) {
    const league = await League.find(params.leagueId)
    if (!league) {
      session.flash('error', 'Liga no encontrada')
      return response.redirect().toRoute('dashboard.leagues')
    }

    const data = await request.validateUsing(createMatchValidator)
    const svc = new BookingService()

    if (data.homeTeamId === data.awayTeamId) {
      session.flash('error', 'Local y visitante deben ser distintos')
      return response.redirect().back()
    }
    if (!(await this.teamsBelong(league.id, data.homeTeamId, data.awayTeamId))) {
      session.flash('error', 'Los equipos no pertenecen a esta liga')
      return response.redirect().back()
    }
    const space = await Space.find(data.spaceId)
    if (!space || space.locationId !== league.locationId) {
      session.flash('error', 'La cancha no pertenece a la locación de la liga')
      return response.redirect().back()
    }
    if (svc.toMinutes(data.endTime) <= svc.toMinutes(data.startTime)) {
      session.flash('error', 'La hora fin debe ser mayor a la de inicio')
      return response.redirect().back()
    }
    if (await svc.hasOverlap(data.spaceId, data.date, data.startTime, data.endTime)) {
      session.flash('error', 'La cancha ya está ocupada en ese horario')
      return response.redirect().back()
    }

    await Match.create({
      leagueId: league.id,
      spaceId: data.spaceId,
      homeTeamId: data.homeTeamId,
      awayTeamId: data.awayTeamId,
      date: DateTime.fromISO(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      status: 'scheduled',
    })
    session.flash('success', 'Partido programado')
    return response.redirect().back()
  }

  async update({ params, request, response, session }: HttpContext) {
    const match = await Match.find(params.id)
    if (!match) {
      session.flash('error', 'Partido no encontrado')
      return response.redirect().back()
    }
    const data = await request.validateUsing(updateMatchValidator)
    const svc = new BookingService()

    const spaceId = data.spaceId ?? match.spaceId
    const date = data.date ?? match.date.toISODate()!
    const startTime = data.startTime ?? match.startTime
    const endTime = data.endTime ?? match.endTime
    const status = data.status ?? match.status

    if (data.homeTeamId && data.awayTeamId && data.homeTeamId === data.awayTeamId) {
      session.flash('error', 'Local y visitante deben ser distintos')
      return response.redirect().back()
    }
    if (svc.toMinutes(endTime) <= svc.toMinutes(startTime)) {
      session.flash('error', 'La hora fin debe ser mayor a la de inicio')
      return response.redirect().back()
    }
    // Only an active match occupies the court; skip the check when cancelling.
    if (status !== 'cancelled' && (await svc.hasOverlap(spaceId, date, startTime, endTime, undefined, match.id))) {
      session.flash('error', 'La cancha ya está ocupada en ese horario')
      return response.redirect().back()
    }

    match.merge({
      spaceId,
      date: DateTime.fromISO(date),
      startTime,
      endTime,
      status,
      homeTeamId: data.homeTeamId ?? match.homeTeamId,
      awayTeamId: data.awayTeamId ?? match.awayTeamId,
    })
    await match.save()
    session.flash('success', 'Partido actualizado')
    return response.redirect().back()
  }

  async destroy({ params, response, session }: HttpContext) {
    const match = await Match.find(params.id)
    if (match) await match.delete()
    session.flash('success', 'Partido eliminado')
    return response.redirect().back()
  }

  async addEvent({ params, request, response, session }: HttpContext) {
    const match = await Match.find(params.id)
    if (!match) {
      session.flash('error', 'Partido no encontrado')
      return response.redirect().back()
    }
    const data = await request.validateUsing(createMatchEventValidator)

    if (data.teamId !== match.homeTeamId && data.teamId !== match.awayTeamId) {
      session.flash('error', 'El equipo no juega este partido')
      return response.redirect().back()
    }
    if (data.playerId) {
      const player = await Player.query().where('id', data.playerId).where('team_id', data.teamId).first()
      if (!player) {
        session.flash('error', 'El jugador no pertenece a ese equipo')
        return response.redirect().back()
      }
    }

    await MatchEvent.create({
      matchId: match.id,
      teamId: data.teamId,
      playerId: data.playerId ?? null,
      type: data.type,
      minute: data.minute ?? null,
    })
    // Logging the minuta marks the match as played.
    if (match.status === 'scheduled') {
      match.status = 'played'
      await match.save()
    }
    session.flash('success', 'Registrado en la minuta')
    return response.redirect().back()
  }

  async removeEvent({ params, response, session }: HttpContext) {
    const event = await MatchEvent.find(params.eventId)
    if (event) await event.delete()
    session.flash('success', 'Evento eliminado')
    return response.redirect().back()
  }
}
