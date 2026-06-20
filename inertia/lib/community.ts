/**
 * Community photos — real Futhub pickup games and teams. Served statically from
 * /public/comunidad (NOT /public/assets, which Vite wipes on each build).
 */
export type CommunityPhoto = { src: string; alt: string }

export const COMMUNITY_PHOTOS: CommunityPhoto[] = [
  { src: '/comunidad/comunidad-01.jpeg', alt: 'Duelo por el balón en una reta nocturna' },
  { src: '/comunidad/comunidad-02.jpeg', alt: 'Jugada a toda velocidad en pasto sintético' },
  { src: '/comunidad/comunidad-03.jpeg', alt: 'Control del balón bajo las luces' },
  { src: '/comunidad/comunidad-04.jpeg', alt: 'Equipo posando antes del partido' },
  { src: '/comunidad/comunidad-05.jpeg', alt: 'Celebración entre compañeros de equipo' },
  { src: '/comunidad/comunidad-06.jpeg', alt: 'Acción en el área durante la reta' },
  { src: '/comunidad/comunidad-07.jpeg', alt: 'Equipo mixto listo para saltar a la cancha' },
  { src: '/comunidad/comunidad-08.jpeg', alt: 'Jugadores disputando el balón' },
  { src: '/comunidad/comunidad-09.jpeg', alt: 'Foto de equipo al cierre del torneo' },
]

/** Dramatic action shot used as the hero backdrop. */
export const HERO_PHOTO = COMMUNITY_PHOTOS[0]
