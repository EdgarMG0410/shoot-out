import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Team from '#models/team'
import Player from '#models/player'
import { createPlayerValidator, updatePlayerValidator } from '#validators/league'
import { generatePlayerKey, miniCurp } from '#services/player_key'

export default class DashboardPlayersController {
  async store({ params, request, response, session }: HttpContext) {
    const team = await Team.find(params.teamId)
    if (!team) {
      session.flash('error', 'Equipo no encontrado')
      return response.redirect().back()
    }
    const data = await request.validateUsing(createPlayerValidator)

    const fullName = [data.firstName, data.paternalSurname, data.maternalSurname]
      .filter(Boolean)
      .join(' ')

    const playerKey = await generatePlayerKey(
      data.paternalSurname,
      data.maternalSurname ?? '',
      data.firstName,
      data.birthdate
    )

    // Identity check (no manual CURP lookup): same mini-CURP base (name+birthdate)
    // or same phone points at the same person. Block re-adding to the SAME team;
    // allow across teams but flag it. This is the groundwork for future validation.
    const base = miniCurp(
      data.paternalSurname,
      data.maternalSurname ?? '',
      data.firstName,
      data.birthdate
    )
    const existing = await Player.query()
      .where((q) => {
        q.whereILike('player_key', `${base}%`)
        if (data.phone) q.orWhere('phone', data.phone)
      })
      .preload('team')
      .first()

    if (existing && existing.teamId === team.id) {
      session.flash('error', `Ese jugador ya está en este equipo (${existing.name}).`)
      return response.redirect().back()
    }

    await Player.create({
      teamId: team.id,
      name: fullName,
      firstName: data.firstName,
      paternalSurname: data.paternalSurname,
      maternalSurname: data.maternalSurname ?? null,
      birthdate: DateTime.fromISO(data.birthdate),
      photoUrl: data.photoUrl,
      phone: data.phone ?? null,
      playerKey,
      number: data.number ?? null,
    })

    session.flash(
      'success',
      existing
        ? `Jugador agregado. Ojo: ya estaba registrado en ${existing.team?.name ?? 'otro equipo'}.`
        : 'Jugador agregado'
    )
    return response.redirect().back()
  }

  async update({ params, request, response, session }: HttpContext) {
    const player = await Player.find(params.id)
    if (!player) {
      session.flash('error', 'Jugador no encontrado')
      return response.redirect().back()
    }
    const data = await request.validateUsing(updatePlayerValidator)
    const { birthdate, ...rest } = data
    player.merge(rest)
    if (birthdate) player.birthdate = DateTime.fromISO(birthdate)

    // Keep the display name in sync when any name part changes.
    if (data.firstName || data.paternalSurname || data.maternalSurname !== undefined) {
      player.name = [player.firstName, player.paternalSurname, player.maternalSurname]
        .filter(Boolean)
        .join(' ')
    }

    // A backfilled key has a 000000 date block (no birthdate was known). Once a
    // real birthdate is supplied, mint a proper key. Real keys are never reissued.
    const isPlaceholderKey = !player.playerKey || player.playerKey.slice(4, 10) === '000000'
    if (birthdate && isPlaceholderKey && player.firstName && player.paternalSurname) {
      player.playerKey = await generatePlayerKey(
        player.paternalSurname,
        player.maternalSurname ?? '',
        player.firstName,
        birthdate
      )
    }

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
