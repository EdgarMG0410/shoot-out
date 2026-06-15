import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import League from '#models/league'
import Location from '#models/location'
import Space from '#models/space'
import StandingsService from '#services/standings_service'
import { createLeagueValidator, updateLeagueValidator } from '#validators/league'

export default class DashboardLeaguesController {
  async index({ inertia }: HttpContext) {
    const leagues = await League.query()
      .preload('location')
      .withCount('teams')
      .withCount('matches')
      .orderBy('name')
    const locations = await Location.query().orderBy('name')

    return inertia.render('dashboard/leagues', {
      leagues: leagues.map((l) => ({
        id: l.id,
        name: l.name,
        locationId: l.locationId,
        locationName: l.location?.name ?? '—',
        seasonStart: l.seasonStart?.toISODate() ?? null,
        seasonEnd: l.seasonEnd?.toISODate() ?? null,
        status: l.status,
        teamsCount: Number(l.$extras.teams_count ?? 0),
        matchesCount: Number(l.$extras.matches_count ?? 0),
      })),
      locations: locations.map((l) => ({ id: l.id, name: l.name })),
    })
  }

  async store({ request, response, session }: HttpContext) {
    const data = await request.validateUsing(createLeagueValidator)
    const location = await Location.find(data.locationId)
    if (!location) {
      session.flash('error', 'Locación no encontrada')
      return response.redirect().toRoute('dashboard.leagues')
    }
    const league = await League.create({
      ...data,
      seasonStart: data.seasonStart ? DateTime.fromISO(data.seasonStart) : null,
      seasonEnd: data.seasonEnd ? DateTime.fromISO(data.seasonEnd) : null,
    })
    session.flash('success', 'Liga creada')
    return response.redirect().toRoute('dashboard.leagues.show', { id: league.id })
  }

  async show({ params, inertia, response, session }: HttpContext) {
    const league = await League.query()
      .where('id', params.id)
      .preload('location')
      .preload('teams', (q) => q.preload('players', (p) => p.orderBy('number')).orderBy('name'))
      .first()

    if (!league) {
      session.flash('error', 'Liga no encontrada')
      return response.redirect().toRoute('dashboard.leagues')
    }

    const matches = await league
      .related('matches')
      .query()
      .preload('space')
      .preload('homeTeam')
      .preload('awayTeam')
      .preload('events', (e) => e.preload('player').orderBy('minute'))
      .orderBy('date')
      .orderBy('start_time')

    const spaces = await Space.query().where('location_id', league.locationId).orderBy('name')
    const { standings, scorers, cards } = await new StandingsService().compute(league.id)

    return inertia.render('dashboard/league_show', {
      league: {
        id: league.id,
        name: league.name,
        description: league.description,
        locationId: league.locationId,
        locationName: league.location?.name ?? '—',
        seasonStart: league.seasonStart?.toISODate() ?? null,
        seasonEnd: league.seasonEnd?.toISODate() ?? null,
        status: league.status,
      },
      spaces: spaces.map((s) => ({ id: s.id, name: s.name })),
      teams: league.teams.map((t) => ({
        id: t.id,
        name: t.name,
        logoUrl: t.logoUrl,
        players: t.players.map((p) => ({ id: p.id, name: p.name, number: p.number })),
      })),
      matches: matches.map((m) => {
        const homeGoals = m.events.filter((e) => e.type === 'goal' && e.teamId === m.homeTeamId).length
        const awayGoals = m.events.filter((e) => e.type === 'goal' && e.teamId === m.awayTeamId).length
        return {
          id: m.id,
          spaceId: m.spaceId,
          spaceName: m.space?.name ?? '—',
          date: m.date?.toISODate() ?? '',
          startTime: m.startTime,
          endTime: m.endTime,
          status: m.status,
          homeTeamId: m.homeTeamId,
          homeTeam: m.homeTeam?.name ?? '—',
          awayTeamId: m.awayTeamId,
          awayTeam: m.awayTeam?.name ?? '—',
          homeGoals,
          awayGoals,
          events: m.events.map((e) => ({
            id: e.id,
            teamId: e.teamId,
            playerId: e.playerId,
            playerName: e.player?.name ?? null,
            type: e.type,
            minute: e.minute,
          })),
        }
      }),
      standings,
      scorers,
      cards,
    })
  }

  async update({ params, request, response, session }: HttpContext) {
    const league = await League.find(params.id)
    if (!league) {
      session.flash('error', 'Liga no encontrada')
      return response.redirect().toRoute('dashboard.leagues')
    }
    const data = await request.validateUsing(updateLeagueValidator)
    league.merge({
      ...data,
      seasonStart:
        data.seasonStart === undefined
          ? league.seasonStart
          : data.seasonStart
            ? DateTime.fromISO(data.seasonStart)
            : null,
      seasonEnd:
        data.seasonEnd === undefined
          ? league.seasonEnd
          : data.seasonEnd
            ? DateTime.fromISO(data.seasonEnd)
            : null,
    })
    await league.save()
    session.flash('success', 'Liga actualizada')
    return response.redirect().back()
  }

  async destroy({ params, response, session }: HttpContext) {
    const league = await League.find(params.id)
    if (league) await league.delete()
    session.flash('success', 'Liga eliminada')
    return response.redirect().toRoute('dashboard.leagues')
  }
}
