import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import Location from '#models/location'
import Space from '#models/space'
import League from '#models/league'
import Lead from '#models/lead'
import BookingService from '#services/booking_service'
import StandingsService from '#services/standings_service'
import { createLeadValidator } from '#validators/lead'

/**
 * Public website (no auth). Anyone can browse canchas/terrazas and league
 * stats. Booking still requires identifying with an email (see /acceso).
 */
export default class PublicController {
  /** Landing — active locations with their active spaces, plus active leagues. */
  async home({ inertia }: HttpContext) {
    const locations = await Location.query()
      .where('status', 'active')
      .preload('spaces', (q) => q.where('status', 'active').orderBy('name'))
      .orderBy('name')

    const leagues = await League.query().preload('location').withCount('teams').orderBy('name')

    return inertia.render('public/home', {
      locations: locations.map((l) => ({
        id: l.id,
        name: l.name,
        address: l.address,
        zona: l.zona,
        phone: l.phone,
        photoUrl: l.photoUrl,
        spaces: l.spaces.map((s) => ({
          id: s.id,
          name: s.name,
          type: s.type,
          size: s.size,
          pricePerHour: s.pricePerHour,
          photoUrl: s.photoUrl,
          openTime: s.openTime,
          closeTime: s.closeTime,
        })),
      })),
      leagues: leagues.map((l) => ({
        id: l.id,
        name: l.name,
        locationName: l.location?.name ?? '—',
        status: l.status,
        teamsCount: Number(l.$extras.teams_count ?? 0),
      })),
    })
  }

  /** Public space detail with a read-only schedule for the chosen day. */
  async space({ params, request, inertia, response }: HttpContext) {
    const space = await Space.query().where('id', params.id).preload('location').first()
    if (!space) return response.redirect().toPath('/')

    const date = (request.qs().date as string) || DateTime.now().toISODate()!
    const occupied = await new BookingService().getOccupiedSlots(space.id, date)

    return inertia.render('public/space', {
      space: {
        id: space.id,
        name: space.name,
        type: space.type,
        size: space.size,
        pricePerHour: space.pricePerHour,
        capacity: space.capacity,
        photoUrl: space.photoUrl,
        openTime: space.openTime,
        closeTime: space.closeTime,
        location: space.location?.name ?? '—',
        address: space.location?.address ?? null,
        status: space.status,
      },
      date,
      occupied,
    })
  }

  /** Public league directory. */
  async leagues({ inertia }: HttpContext) {
    const leagues = await League.query()
      .preload('location')
      .withCount('teams')
      .withCount('matches')
      .orderBy('name')

    return inertia.render('public/leagues', {
      leagues: leagues.map((l) => ({
        id: l.id,
        name: l.name,
        locationName: l.location?.name ?? '—',
        status: l.status,
        seasonStart: l.seasonStart?.toISODate() ?? null,
        seasonEnd: l.seasonEnd?.toISODate() ?? null,
        teamsCount: Number(l.$extras.teams_count ?? 0),
        matchesCount: Number(l.$extras.matches_count ?? 0),
      })),
    })
  }

  /** Public league page — standings, scorers, cards and calendar (read-only). */
  async league({ params, inertia, response }: HttpContext) {
    const league = await League.query().where('id', params.id).preload('location').first()
    if (!league) return response.redirect().toPath('/ligas')

    const matches = await league
      .related('matches')
      .query()
      .preload('space')
      .preload('homeTeam')
      .preload('awayTeam')
      .preload('events')
      .orderBy('date')
      .orderBy('start_time')

    const { standings, scorers, cards } = await new StandingsService().compute(league.id)

    return inertia.render('public/league', {
      league: {
        id: league.id,
        name: league.name,
        description: league.description,
        locationName: league.location?.name ?? '—',
        seasonStart: league.seasonStart?.toISODate() ?? null,
        seasonEnd: league.seasonEnd?.toISODate() ?? null,
        status: league.status,
      },
      matches: matches.map((m) => {
        const homeGoals = m.events.filter(
          (e) => e.type === 'goal' && e.teamId === m.homeTeamId
        ).length
        const awayGoals = m.events.filter(
          (e) => e.type === 'goal' && e.teamId === m.awayTeamId
        ).length
        return {
          id: m.id,
          spaceName: m.space?.name ?? '—',
          date: m.date?.toISODate() ?? '',
          startTime: m.startTime,
          endTime: m.endTime,
          status: m.status,
          homeTeam: m.homeTeam?.name ?? '—',
          awayTeam: m.awayTeam?.name ?? '—',
          homeGoals,
          awayGoals,
        }
      }),
      standings,
      scorers,
      cards,
    })
  }

  /** Landing lead capture — interested player or court owner. */
  async lead({ request, response, session }: HttpContext) {
    const data = await request.validateUsing(createLeadValidator)
    await Lead.create(data)
    session.flash(
      'success',
      data.type === 'cancha'
        ? '¡Gracias! Te contactaremos para registrar tu cancha en Futhub.'
        : '¡Gracias! Te avisaremos en cuanto haya canchas disponibles cerca de ti.'
    )
    return response.redirect().back()
  }
}
