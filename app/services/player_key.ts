import { randomBytes } from 'node:crypto'
import Player from '#models/player'

/**
 * Mini-CURP player identity key.
 *
 * The first 10 chars mirror the official CURP name+birthdate block:
 *   [1] apellido paterno: primera letra
 *   [2] apellido paterno: primera vocal interna
 *   [3] apellido materno: primera letra (X si no hay)
 *   [4] nombre: primera letra (saltando JOSE/MARIA compuestos)
 *   [5-10] fecha de nacimiento YYMMDD
 * A 3-char random "homoclave" is appended so two namesakes born the same day
 * don't collide. We do NOT encode sexo/estado — short key by design.
 */

const VOWELS = 'AEIOU'
// First-name particles the real CURP skips to reach the "real" given name.
const COMPOUND = new Set(['JOSE', 'MARIA', 'MA', 'J'])

/** Uppercase, strip accents and anything that isn't a letter or space. */
function clean(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z ]/g, '')
    .trim()
}

function firstInnerVowel(word: string): string {
  for (let i = 1; i < word.length; i++) {
    if (VOWELS.includes(word[i])) return word[i]
  }
  return 'X'
}

/** "MARIA FERNANDA" → "FERNANDA"; "JUAN" → "JUAN". */
function stripCompound(nombre: string): string {
  const parts = nombre.split(/\s+/).filter(Boolean)
  if (parts.length > 1 && COMPOUND.has(parts[0])) return parts[1]
  return parts[0] ?? ''
}

/** Deterministic 10-char base. Same person + same birthdate → same base. */
export function miniCurp(
  paterno: string,
  materno: string,
  nombre: string,
  birthdate: string // 'YYYY-MM-DD'
): string {
  const p = clean(paterno)
  const m = clean(materno) || 'X'
  const n = stripCompound(clean(nombre))
  const [year, month, day] = birthdate.split('-')

  return (
    (p[0] ?? 'X') +
    firstInnerVowel(p) +
    (m[0] ?? 'X') +
    (n[0] ?? 'X') +
    year.slice(2) +
    month +
    day
  )
}

/**
 * Full unique key: mini-CURP base + random homoclave, retried against the DB
 * until free. The DB `unique` constraint is the real guard against races; this
 * just avoids the obvious collision before insert.
 */
export async function generatePlayerKey(
  paterno: string,
  materno: string,
  nombre: string,
  birthdate: string
): Promise<string> {
  const base = miniCurp(paterno, materno, nombre, birthdate)

  for (let i = 0; i < 12; i++) {
    const homoclave = randomBytes(2).toString('hex').slice(0, 3).toUpperCase()
    const key = base + homoclave
    const taken = await Player.findBy('playerKey', key)
    if (!taken) return key
  }
  throw new Error('No se pudo generar un player_key único')
}
