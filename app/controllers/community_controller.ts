import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import Location from '#models/location'
import OpenMatch from '#models/open_match'
import OpenMatchPlayer from '#models/open_match_player'
import PlayerProfile from '#models/player_profile'
import TeamRecruitment from '#models/team_recruitment'
import {
  createOpenMatchValidator,
  joinOpenMatchValidator,
  upsertPlayerProfileValidator,
  createTeamRecruitmentValidator,
} from '#validators/community'

/**
 * Comunidad futbolera (public, no auth). Open matches ("me faltan 3"), player
 * cards and team recruitment posts. Everyone identifies with just their email.
 */
export default class CommunityController {
  /** One page with three tabs: partidos abiertos, jugadores, equipos. */
  async index({ inertia }: HttpContext) {
    const today = DateTime.now().startOf('day').toISODate()!

    const matches = await OpenMatch.query()
      .where('status', '!=', 'closed')
      .andWhere('date', '>=', today)
      .preload('location')
      .preload('players')
      .orderBy('date')
      .orderBy('start_time')

    const players = await PlayerProfile.query().orderBy('created_at', 'desc').limit(60)
    const recruitments = await TeamRecruitment.query()
      .where('status', 'open')
      .orderBy('created_at', 'desc')
    const locations = await Location.query().where('status', 'active').orderBy('name')

    return inertia.render('public/comunidad', {
      matches: matches.map((m) => ({
        id: m.id,
        title: m.title,
        hostName: m.hostName,
        locationName: m.location?.name ?? null,
        zona: m.zona,
        date: m.date?.toISODate() ?? '',
        startTime: m.startTime,
        endTime: m.endTime,
        level: m.level,
        spotsTotal: m.spotsTotal,
        joined: m.players.length,
        status: m.status,
        notes: m.notes,
        players: m.players.map((p) => ({ name: p.name, position: p.position })),
      })),
      players: players.map((p) => ({
        id: p.id,
        name: p.name,
        position: p.position,
        level: p.level,
        zona: p.zona,
        photoUrl: p.photoUrl,
      })),
      recruitments: recruitments.map((r) => ({
        id: r.id,
        teamName: r.teamName,
        contactName: r.contactName,
        contactEmail: r.contactEmail,
        zona: r.zona,
        level: r.level,
        positionsNeeded: r.positionsNeeded,
        notes: r.notes,
      })),
      locations: locations.map((l) => ({ id: l.id, name: l.name, zona: l.zona })),
    })
  }

  /** Publish an open match (partido abierto). */
  async storeMatch({ request, response, session }: HttpContext) {
    const data = await request.validateUsing(createOpenMatchValidator)
    await OpenMatch.create({
      ...data,
      date: DateTime.fromISO(data.date),
      level: data.level ?? 'mixto',
      status: 'open',
    })
    session.flash('success', '¡Partido publicado! Otros jugadores ya pueden unirse.')
    return response.redirect().toRoute('community')
  }

  /** Join an open match ("quiero jugar"). */
  async joinMatch({ params, request, response, session }: HttpContext) {
    const match = await OpenMatch.query().where('id', params.id).preload('players').first()
    if (!match) {
      session.flash('error', 'Partido no encontrado')
      return response.redirect().toRoute('community')
    }
    if (match.status !== 'open') {
      session.flash('error', 'Este partido ya está completo o cerrado.')
      return response.redirect().toRoute('community')
    }

    const data = await request.validateUsing(joinOpenMatchValidator)
    if (match.players.some((p) => p.email === data.email)) {
      session.flash('error', 'Ya estás anotado en este partido.')
      return response.redirect().toRoute('community')
    }

    await OpenMatchPlayer.create({ openMatchId: match.id, ...data })

    // Auto-close enrollment once spots fill up.
    if (match.players.length + 1 >= match.spotsTotal) {
      match.status = 'full'
      await match.save()
    }

    session.flash('success', '¡Listo! Quedaste anotado. El organizador te contactará.')
    return response.redirect().toRoute('community')
  }

  /** Create or update a player card (identity = email). */
  async storePlayer({ request, response, session }: HttpContext) {
    const data = await request.validateUsing(upsertPlayerProfileValidator)
    await PlayerProfile.updateOrCreate(
      { email: data.email },
      { ...data, level: data.level ?? 'intermedio' }
    )
    session.flash('success', 'Tu perfil de jugador quedó publicado.')
    return response.redirect().toRoute('community')
  }

  /** Publish a team recruitment post (equipo buscando jugadores). */
  async storeRecruitment({ request, response, session }: HttpContext) {
    const data = await request.validateUsing(createTeamRecruitmentValidator)
    await TeamRecruitment.create({ ...data, level: data.level ?? 'mixto', status: 'open' })
    session.flash('success', 'Tu equipo ya aparece buscando jugadores.')
    return response.redirect().toRoute('community')
  }
}
