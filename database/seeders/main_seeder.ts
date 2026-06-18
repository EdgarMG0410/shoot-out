import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import User from '#models/user'
import Location from '#models/location'
import Space from '#models/space'
import Event from '#models/event'
import League from '#models/league'
import Team from '#models/team'
import Player from '#models/player'
import Match from '#models/match'
import MatchEvent from '#models/match_event'
import OpenMatch from '#models/open_match'
import OpenMatchPlayer from '#models/open_match_player'
import PlayerProfile from '#models/player_profile'
import TeamRecruitment from '#models/team_recruitment'

/**
 * Idempotent seeder (updateOrCreate) — safe to run multiple times.
 * Passwords are hashed automatically by the User model's AuthFinder hook.
 */
export default class extends BaseSeeder {
  async run() {
    // ---- Users ----
    await User.updateOrCreate(
      { email: 'admin@shootout.mx' },
      {
        fullName: 'Admin Shootout',
        email: 'admin@shootout.mx',
        password: 'password123',
        role: 'admin',
      }
    )

    const renters = [
      { email: 'player@shootout.mx', fullName: 'Juan Pérez', renterType: 'particular' },
      { email: 'liga@shootout.mx', fullName: 'Liga Amateur GDL', renterType: 'liga' },
      { email: 'empresa@shootout.mx', fullName: 'Constructora MX', renterType: 'empresa' },
    ] as const
    for (const r of renters) {
      await User.updateOrCreate({ email: r.email }, { ...r, password: 'password123', role: 'user' })
    }

    // ---- Locations — Shoot Out pilot, 3 sucursales ----
    const centro = await Location.updateOrCreate(
      { name: 'Shoot Out Centro' },
      {
        name: 'Shoot Out Centro',
        address: 'Av. Chapultepec 100, Guadalajara',
        zona: 'Centro, Guadalajara',
        phone: '33 1111 2222',
        photoUrl: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=1200&q=70',
        status: 'active',
      }
    )
    const norte = await Location.updateOrCreate(
      { name: 'Shoot Out Norte' },
      {
        name: 'Shoot Out Norte',
        address: 'Av. Patria 2300, Zapopan',
        zona: 'Zapopan',
        phone: '33 3333 4444',
        photoUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=70',
        status: 'active',
      }
    )
    const sur = await Location.updateOrCreate(
      { name: 'Shoot Out Sur' },
      {
        name: 'Shoot Out Sur',
        address: 'Av. López de Legazpi 500, Tlaquepaque',
        zona: 'Tlaquepaque',
        phone: '33 5555 6666',
        photoUrl: 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=1200&q=70',
        status: 'active',
      }
    )

    // ---- Spaces (canchas, terrazas, otros) ----
    const FOTO = {
      cancha5: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1200&q=70',
      cancha7: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1200&q=70',
      cancha11: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&q=70',
      terraza: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&q=70',
    }
    const spaces = [
      {
        name: 'Cancha Centro',
        locationId: centro.id,
        type: 'cancha',
        size: '5',
        pricePerHour: 450,
        capacity: null,
        photoUrl: FOTO.cancha5,
        openTime: '08:00',
        closeTime: '23:00',
        status: 'active',
      },
      {
        name: 'Cancha Techada',
        locationId: centro.id,
        type: 'cancha',
        size: '5',
        pricePerHour: 500,
        capacity: null,
        photoUrl: FOTO.cancha5,
        openTime: '09:00',
        closeTime: '22:00',
        status: 'blocked',
      },
      {
        name: 'Terraza Centro',
        locationId: centro.id,
        type: 'terraza',
        size: null,
        pricePerHour: 800,
        capacity: 120,
        photoUrl: FOTO.terraza,
        openTime: '12:00',
        closeTime: '23:30',
        status: 'active',
      },
      {
        name: 'Cancha Norte',
        locationId: norte.id,
        type: 'cancha',
        size: '7',
        pricePerHour: 650,
        capacity: null,
        photoUrl: FOTO.cancha7,
        openTime: '07:00',
        closeTime: '23:00',
        status: 'active',
      },
      {
        name: 'Estadio Norte',
        locationId: norte.id,
        type: 'cancha',
        size: '11',
        pricePerHour: 1200,
        capacity: null,
        photoUrl: FOTO.cancha11,
        openTime: '08:00',
        closeTime: '22:00',
        status: 'active',
      },
      {
        name: 'Cancha Sur 7',
        locationId: sur.id,
        type: 'cancha',
        size: '7',
        pricePerHour: 600,
        capacity: null,
        photoUrl: FOTO.cancha7,
        openTime: '08:00',
        closeTime: '23:00',
        status: 'active',
      },
      {
        name: 'Cancha Sur 5',
        locationId: sur.id,
        type: 'cancha',
        size: '5',
        pricePerHour: 420,
        capacity: null,
        photoUrl: FOTO.cancha5,
        openTime: '08:00',
        closeTime: '23:00',
        status: 'active',
      },
    ] satisfies {
      name: string
      locationId: number
      type: 'cancha' | 'terraza' | 'otro'
      size: '5' | '7' | '11' | null
      pricePerHour: number
      capacity: number | null
      photoUrl: string
      openTime: string
      closeTime: string
      status: 'active' | 'blocked'
    }[]

    for (const s of spaces) {
      await Space.updateOrCreate({ name: s.name }, s)
    }

    // ---- Demo events (only if none exist) ----
    const eventCount = await Event.query().count('* as c').first()
    if (Number(eventCount?.$extras.c ?? 0) === 0) {
      const canchaCentro = await Space.findBy('name', 'Cancha Centro')
      const terrazaCentro = await Space.findBy('name', 'Terraza Centro')

      if (canchaCentro) {
        await Event.create({
          locationId: centro.id,
          spaceId: canchaCentro.id,
          name: 'Torneo Relámpago 5v5',
          description: 'Eliminatoria de un día, premios al campeón.',
          date: DateTime.now().plus({ days: 3 }),
          startTime: '09:00',
          endTime: '13:00',
          capacity: 40,
          price: 2000,
          status: 'scheduled',
        })
      }
      if (terrazaCentro) {
        await Event.create({
          locationId: centro.id,
          spaceId: terrazaCentro.id,
          name: 'Fiesta de fin de torneo',
          description: 'Convivencia en la terraza.',
          date: DateTime.now().plus({ days: 5 }),
          startTime: '19:00',
          endTime: '23:00',
          capacity: 120,
          price: 5000,
          status: 'scheduled',
        })
      }
    }

    // ---- Demo leagues (idempotent per name) ----
    await this.seedLeague({
      locationId: centro.id,
      spaceName: 'Cancha Centro',
      name: 'Liga Amateur GDL',
      description: 'Torneo de fútbol 5 entre equipos locales.',
      roster: {
        'Halcones': ['Luis Soto', 'Marco Díaz', 'Iván Ruiz', 'Pepe López'],
        'Pumas': ['Carlos Vega', 'Toño Mora', 'Beto Cruz', 'Saúl Lara'],
        'Real Centro': ['Memo Ríos', 'Hugo Paz', 'Nico Bravo', 'Rafa Gil'],
        'Tiburones': ['Edu Mata', 'Aldo Vera', 'Checo Luna', 'Pol Reyes'],
      },
    })
    await this.seedLeague({
      locationId: norte.id,
      spaceName: 'Cancha Norte',
      name: 'Copa Zapopan 7v7',
      description: 'Copa de fútbol 7 en la sucursal Norte.',
      roster: {
        'Cóndores': ['Diego Salas', 'Iker Mena', 'Bruno Tovar', 'Lalo Vega'],
        'Atlético Patria': ['Raúl Cano', 'Beto Nava', 'Toño Lira', 'Chuy Mora'],
        'Lobos': ['Emi Ponce', 'Gael Ríos', 'Dani Quezada', 'Pau Serna'],
        'Venados': ['Cris Olvera', 'Beto Fierro', 'Nacho Lomelí', 'Óscar Vidal'],
      },
    })
    await this.seedLeague({
      locationId: sur.id,
      spaceName: 'Cancha Sur 7',
      name: 'Liga Sur Dominical',
      description: 'Liga dominical de fútbol 7 en Tlaquepaque.',
      roster: {
        'Deportivo Sur': ['Memo Aceves', 'Tavo Real', 'Pepe Mora', 'Lalo Cisneros'],
        'Tlaquepaque FC': ['Beto Sandoval', 'Iván Robles', 'Chava Ulloa', 'Pol Méndez'],
        'Guerreros': ['Caleb Ortiz', 'Dani Farías', 'Mau Rentería', 'Aldo Bernal'],
        'Cañeros': ['Hugo Plascencia', 'Saúl Zepeda', 'Rafa Becerra', 'Nico Aguirre'],
      },
    })

    // ---- Comunidad demo (only if none exist) ----
    const openMatchCount = await OpenMatch.query().count('* as c').first()
    if (Number(openMatchCount?.$extras.c ?? 0) === 0) {
      const reta = await OpenMatch.create({
        title: 'Reta 5v5 — nos faltan 3',
        hostName: 'Juan Pérez',
        hostEmail: 'player@shootout.mx',
        locationId: centro.id,
        zona: 'Centro, Guadalajara',
        date: DateTime.now().plus({ days: 1 }),
        startTime: '20:00',
        endTime: '21:00',
        level: 'intermedio',
        spotsTotal: 4,
        notes: 'Buen ambiente, llevar jersey claro y oscuro.',
        status: 'open',
      })
      await OpenMatchPlayer.createMany([
        { openMatchId: reta.id, name: 'Marco Díaz', email: 'marco@demo.mx', position: 'Defensa' },
      ])

      await OpenMatch.create({
        title: 'Cascarita dominical 7v7',
        hostName: 'Liga Amateur GDL',
        hostEmail: 'liga@shootout.mx',
        locationId: norte.id,
        zona: 'Zapopan',
        date: DateTime.now().plus({ days: 4 }),
        startTime: '10:00',
        endTime: '11:30',
        level: 'mixto',
        spotsTotal: 6,
        notes: 'Familiar, todos los niveles bienvenidos.',
        status: 'open',
      })

      await PlayerProfile.createMany([
        {
          name: 'Iván Ruiz',
          email: 'ivan@demo.mx',
          position: 'Delantero',
          level: 'avanzado',
          zona: 'Zapopan',
        },
        {
          name: 'Pepe López',
          email: 'pepe@demo.mx',
          position: 'Portero',
          level: 'intermedio',
          zona: 'Centro, Guadalajara',
        },
        {
          name: 'Saúl Lara',
          email: 'saul@demo.mx',
          position: 'Medio',
          level: 'principiante',
          zona: 'Tlaquepaque',
        },
      ])

      await TeamRecruitment.createMany([
        {
          teamName: 'Halcones FC',
          contactName: 'Luis Soto',
          contactEmail: 'halcones@demo.mx',
          zona: 'Centro, Guadalajara',
          level: 'intermedio',
          positionsNeeded: 'Portero, Defensa central',
          notes: 'Jugamos liga los martes, buscamos 2 refuerzos.',
          status: 'open',
        },
      ])
    }
  }

  /**
   * Seed one demo league with 4 teams, rosters, one played match (with a minuta
   * that drives standings/scorers) and one scheduled match. Idempotent: matches
   * the league by name and skips if its teams already exist.
   */
  private async seedLeague(args: {
    locationId: number
    spaceName: string
    name: string
    description: string
    roster: Record<string, string[]>
  }) {
    const existing = await League.findBy('name', args.name)
    const league =
      existing ??
      (await League.create({
        locationId: args.locationId,
        name: args.name,
        description: args.description,
        seasonStart: DateTime.now().startOf('month'),
        seasonEnd: DateTime.now().plus({ months: 3 }),
        status: 'active',
      }))

    // Already populated → idempotent no-op.
    const teamCount = await Team.query().where('league_id', league.id).count('* as c').first()
    if (Number(teamCount?.$extras.c ?? 0) > 0) return

    const space = await Space.findBy('name', args.spaceName)

    const teams: Team[] = []
    const firstPlayer: Record<number, Player> = {}
    for (const [name, players] of Object.entries(args.roster)) {
      const team = await Team.create({ leagueId: league.id, name })
      teams.push(team)
      let n = 1
      for (const p of players) {
        const player = await Player.create({ teamId: team.id, name: p, number: n })
        if (n === 1) firstPlayer[team.id] = player
        n++
      }
    }

    if (space && teams.length >= 4) {
      // Round 1, match A — played with a recorded minuta (2-1).
      const m1 = await Match.create({
        leagueId: league.id,
        spaceId: space.id,
        homeTeamId: teams[0].id,
        awayTeamId: teams[1].id,
        date: DateTime.now().plus({ days: 7 }),
        startTime: '10:00',
        endTime: '11:00',
        status: 'played',
      })
      await MatchEvent.createMany([
        {
          matchId: m1.id,
          teamId: teams[0].id,
          playerId: firstPlayer[teams[0].id].id,
          type: 'goal',
          minute: 12,
        },
        {
          matchId: m1.id,
          teamId: teams[0].id,
          playerId: firstPlayer[teams[0].id].id,
          type: 'goal',
          minute: 34,
        },
        {
          matchId: m1.id,
          teamId: teams[1].id,
          playerId: firstPlayer[teams[1].id].id,
          type: 'goal',
          minute: 50,
        },
        {
          matchId: m1.id,
          teamId: teams[1].id,
          playerId: firstPlayer[teams[1].id].id,
          type: 'yellow',
          minute: 60,
        },
      ])

      // Round 1, match B — scheduled (blocks the court right after).
      await Match.create({
        leagueId: league.id,
        spaceId: space.id,
        homeTeamId: teams[2].id,
        awayTeamId: teams[3].id,
        date: DateTime.now().plus({ days: 7 }),
        startTime: '11:00',
        endTime: '12:00',
        status: 'scheduled',
      })
    }
  }
}
