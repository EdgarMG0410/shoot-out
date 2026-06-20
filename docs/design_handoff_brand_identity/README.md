# Handoff: FORMA — Football App Brand Identity

## Overview
Brand identity system for a **soccer fan-community app aimed at amateur footballers** (find matches, fill five-a-side teams, follow Sunday-league form). The system is **monochrome + premium** with a single **electric-green** accent that means *action*. This bundle gives you everything to implement the brand in your codebase: logo assets, design tokens (CSS + JSON), the type system, and component recipes.

> **Note on the name:** "FORMA" is a **placeholder wordmark**. Swap it for the real product name everywhere it appears.

## About the Design Files
The file in `reference/Brand Identity.dc.html` is a **design reference created in HTML** — a prototype that documents the intended look (two complete brand boards, Direction A dark / Direction B light). It is **not** production code to ship. Recreate the system in your target environment (React/Vue/SwiftUI/etc.) using its established patterns. Start from `tokens.css` / `tokens.json` and the recipes below — those are written to be lifted directly.

## Fidelity
**High-fidelity.** All colours, fonts, sizes, radii, and spacing are final. Reproduce pixel-for-pixel using the exact values here.

---

## Design Tokens

### Colour
| Token | Hex | Role |
|---|---|---|
| Pitch | `#00E676` | **Primary accent — action only** (join / confirm / go). Never decorative. |
| Pitch hover | `#00C853` | Primary button hover/active |
| Pitch ink | `#08140C` | Text/icon placed **on** green |
| Pitch deep | `#00A152` | Green **text** on light backgrounds (legibility) |
| Ink | `#1F2020` | Logo black · primary text on light |
| Carbon | `#0E0F0F` | Dark canvas |
| Steel | `#8E8F90` | Logo grey |
| Slate | `#565858` | Muted text |
| Mist | `#E3E4E0` | Light borders / dividers |
| Paper | `#F4F5F2` | Light canvas |
| White | `#FFFFFF` | |

**Theme surfaces**
- **Dark (A):** bg `#0E0F0F` · surface `#181919` · border `rgba(255,255,255,.10)` · text `#FFFFFF` · muted `#A4A6A4`
- **Light (B):** bg `#F4F5F2` · surface `#FFFFFF` · border `#E3E4E0` · text `#1F2020` · muted `#565858`

> **The one rule:** keep the UI monochrome; the green only ever signals an action. Restraint is the premium signal.

### Typography
| Family | Use | Google Fonts |
|---|---|---|
| **Space Grotesk** | Headlines, scores, team names | weights 400/500/600/700 |
| **Manrope** | UI + body | weights 400/500/600/700/800 |
| **Space Mono** | Labels, kit numbers, stats, scores | weights 400/700 |

Load:
```html
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
```

**Type scale**
| Style | Size | Weight | Notes |
|---|---|---|---|
| Display | 76px | 700 | tracking −0.03em, line-height 0.92 |
| H1 | 46px | 700 | tracking −0.03em |
| H2 | 28px | 600 | |
| H3 | 22px | 600 | |
| Body | 15px | 400 | line-height 1.6 |
| Caption | 12px | 500 | |
| Mono label | 12px | 700 | tracking 0.14–0.18em, UPPERCASE |

### Radius
`sm 8 · md 11 (buttons/inputs) · lg 14 (tiles) · xl 18 (cards) · pill 999`

### Shadow
- Card: `0 12px 40px rgba(0,0,0,0.12)`
- Phone: `0 20px 50px rgba(0,0,0,0.40)`

### Spacing — 4px base
`4 · 8 · 12 · 16 · 20 · 24 · 32 · 48 · 56`

---

## Components

### Buttons (height ≈ 48px, radius 11px)
- **Primary** — bg `#00E676`, text `#08140C`, weight 700. Hover bg `#00C853`. Padding `14px 26px`.
- **Secondary (outline)** — transparent, `1.5px` border ink, text ink. Hover: fill ink, text white.
- **Ghost** — transparent, text `#00A152` (light) / `#00E676` (dark), weight 600. Hover → ink/white.
- **Disabled** — light: bg `#E3E4E0` text `#A9ABA6`; dark: bg `rgba(255,255,255,.08)` text `rgba(255,255,255,.32)`.
- **Icon button** — 48×48, radius 11, green bg, `+` glyph 22px/700.

### Position chips (pills)
Mono 12px/700, radius pill, padding `7px 15px`. Active = green fill `#00E676` + ink text; inactive = `1px` border + ink/white text. Used for `GK · DEF · MID · FWD`.

### Input
Surface bg, `1px` border, radius 11, padding `13px 16px`, Manrope 15px. Active state hint: small `8px` green dot at the right.

### Toggle
50×29 pill, knob 23px. On = green track. Off = `#d8d9d5` (light) / `rgba(255,255,255,.16)` (dark).

### Match card
Surface, radius 18, padding 20. Header: mono 11px green label (e.g. `SUNDAY LEAGUE · WK 7`) + status (`FT`) muted. Two team rows: 34px round crest + team name (Space Grotesk 600/18) + score (Space Grotesk 700/26); winner full-strength, loser muted. `1px` divider between rows.

---

## Logo / Mark

Interlocking monogram (two football "F" forms with rotational symmetry + a central ball-pivot). Two-tone: a primary shape + a counter shape.

**Variants in `assets/marks/`:**
| File | Composition | Use on |
|---|---|---|
| `logo-brand-light.svg` | ink + green | light backgrounds (primary) |
| `logo-brand-dark.svg` | white + green | dark backgrounds (primary) |
| `logo-ink.svg` | solid ink | mono / light, app icon on green |
| `logo-white.svg` | solid white | mono / dark |
| `logo-gray.svg` / `logo-original.svg` | ink + grey | original two-tone |
| `logo-green.svg` | solid green | special use |

**Usage rules**
- **Clear space:** padding ≥ the diameter of the centre ball-pivot on all sides.
- **Minimum size:** 28px digital / 10mm print.
- **App icon:** the ink mark on a green (`#00E676`) rounded square, radius ≈ 22% of size.
- SVGs are cropped to a tight square viewBox — size by setting equal width/height.

---

## Two Directions (in the reference)
The reference board presents two themes to choose from — pick one as the app's default, or support both as light/dark modes (tokens already provide both surface sets):
- **Direction A — Night Pitch:** carbon canvas, white text, green accent. Premium/dark.
- **Direction B — Clean Sheet:** paper canvas, ink text, green accent. Premium/light.

## Interactions & Behavior
- Buttons: 150ms transition on background/colour for hover/active.
- Green is reserved for primary/positive actions and active nav — do not use it for borders, large fills, or decoration.
- Nav: active item = green icon tile; inactive = steel/mist.

## Assets
- `assets/marks/*.svg` — all logo variants (vector, recoloured from the supplied source logo).
- `tokens.css` — CSS custom properties + component recipes (ready to drop in).
- `tokens.json` — same tokens as data for a theme/config layer (e.g. Tailwind theme, design-token pipeline).

## Files
- `reference/Brand Identity.dc.html` — full visual reference (open in a browser; `reference/marks/` holds its images).
- `tokens.css`, `tokens.json` — implementation tokens.
- `assets/marks/` — logo SVGs.
