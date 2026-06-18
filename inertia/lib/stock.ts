/**
 * Curated Unsplash fútbol photos so spaces/locations without an uploaded image
 * still look great instead of showing the empty placeholder. Every id below was
 * verified to resolve (HTTP 200) and be on-subject (pitches, turf, action).
 *
 * The pick is stable per record id, so a given cancha always renders the same
 * photo across pages. As soon as a real `photoUrl` exists, it wins.
 */

const PARAMS = 'w=900&q=70&auto=format&fit=crop'
const u = (id: string) => `https://images.unsplash.com/photo-${id}?${PARAMS}`

// Wide fields / courts — best as cancha card covers.
const CANCHA = [
  '1556056504-5c7696c4c28d', // aerial floodlit pitch
  '1431324155629-1a6deb1dec8d', // night match under lights
  '1517927033932-b3d18e61fb3a', // goal action, floodlit
  '1560272564-c83b66b1ad12', // 5-a-side volley
  '1606925797300-0b35e9d1794e', // turf action, close-up
  '1543351611-58f69d7c1781', // field + goal at sunset
].map(u)

// Neutral turf / ball shots — terrazas, "otro" and generic fallback.
const GENERIC = [
  '1551958219-acbc608c6377', // balls on turf with goal
  '1574629810360-7efbbe195018', // ball + boot on grass
  '1518604666860-9ed391f76460', // match balls on turf
  '1486286701208-1d58e9338013', // ball on wet grass
].map(u)

// Establishment covers.
const LOCATION = [
  '1517927033932-b3d18e61fb3a',
  '1556056504-5c7696c4c28d',
  '1431324155629-1a6deb1dec8d',
].map(u)

const pick = (pool: string[], seed: number) =>
  pool[(((seed | 0) % pool.length) + pool.length) % pool.length]

/** Effective image for a space — its own photo, else a stable stock cancha. */
export function spaceImage(s: { id: number; type: string; photoUrl: string | null }): string {
  if (s.photoUrl) return s.photoUrl
  return pick(s.type === 'cancha' ? CANCHA : GENERIC, s.id)
}

/** Effective cover for a location — its own photo, else a stable stock shot. */
export function locationImage(l: { id: number; photoUrl: string | null }): string {
  if (l.photoUrl) return l.photoUrl
  return pick(LOCATION, l.id)
}
