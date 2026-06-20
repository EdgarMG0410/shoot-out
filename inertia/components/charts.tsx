import { useEffect, useId, useMemo, useRef, useState } from 'react'

/* ============================================================================
 | Bespoke SVG charts — monochrome to match the Futhub brand (graphite ink on
 | bone/chalk). No chart library: hand-rolled so they stay crisp, themeable and
 | dependency-free. Semantic hue (emerald/amber/rose) is used only where colour
 | carries meaning (the status donut).
 ===========================================================================*/

const INK = 'oklch(20% 0.01 250)' // --color-graphite
const GRID = 'oklch(89% 0.007 250)' // --color-bone-3
const MUTED = 'oklch(50% 0.013 250)' // --color-slate-6
const SURFACE = 'oklch(99.3% 0.0015 250)' // --color-chalk
const FONT = 'Geist Variable, system-ui, sans-serif'

/* ------------------------------- AreaChart ------------------------------- */

export type AreaPoint = { label: string; value: number; sub?: string }

type AreaProps = {
  data: AreaPoint[]
  height?: number
  ariaLabel?: string
  showXAxis?: boolean
  showYAxis?: boolean
  smooth?: boolean
  /** Format the primary value (axis + tooltip). */
  formatValue?: (n: number) => string
  /** Unit suffix shown after the tooltip value (e.g. "reservas"). */
  unit?: string
}

const PAD = { top: 18, right: 14, bottom: 28, left: 44 }

export function AreaChart({
  data,
  height = 248,
  ariaLabel = 'Serie temporal',
  showXAxis = true,
  showYAxis = true,
  smooth = true,
  formatValue = (n) => formatAxis(n),
  unit,
}: AreaProps) {
  const gradientId = useId()
  const linePathRef = useRef<SVGPathElement>(null)
  const [pathLength, setPathLength] = useState(0)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const overlayRef = useRef<SVGRectElement>(null)

  const width = 760
  const innerW = width - PAD.left - PAD.right
  const innerH = height - PAD.top - PAD.bottom

  const computed = useMemo(() => {
    if (data.length === 0) return null
    const max = Math.max(...data.map((d) => d.value), 1)
    const niceMax = niceCeiling(max)
    const stepX = data.length > 1 ? innerW / (data.length - 1) : innerW

    const points = data.map((d, i) => ({
      x: PAD.left + i * stepX,
      y: PAD.top + innerH - (d.value / niceMax) * innerH,
      label: d.label,
      value: d.value,
      sub: d.sub,
    }))

    const linePath = smooth ? catmullRomPath(points) : straightPath(points)
    const baseY = PAD.top + innerH
    const areaPath =
      points.length > 0
        ? `${linePath} L ${points[points.length - 1].x} ${baseY} L ${points[0].x} ${baseY} Z`
        : ''

    const yTicks = buildYTicks(niceMax, 4)
    const xLabelIndices = pickXLabelIndices(data.length, 6)
    const peakIndex = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0)

    return { niceMax, points, linePath, areaPath, yTicks, xLabelIndices, peakIndex, stepX }
  }, [data, innerW, innerH, smooth])

  useEffect(() => {
    if (!linePathRef.current) return
    setPathLength(linePathRef.current.getTotalLength())
  }, [computed])

  if (!computed || data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-slate-6">
        Aún no hay datos.
      </div>
    )
  }

  const handleMove = (clientX: number) => {
    const svg = overlayRef.current?.ownerSVGElement
    if (!svg || !computed) return
    const rect = svg.getBoundingClientRect()
    const ratioX = (clientX - rect.left) / rect.width
    const xInChart = ratioX * width - PAD.left
    const idx = Math.round(xInChart / computed.stepX)
    setHoverIndex(Math.max(0, Math.min(data.length - 1, idx)))
  }

  const hover = hoverIndex !== null ? computed.points[hoverIndex] : null

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full select-none"
      role="img"
      aria-label={ariaLabel}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`area-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={INK} stopOpacity="0.16" />
          <stop offset="100%" stopColor={INK} stopOpacity="0" />
        </linearGradient>
      </defs>

      {showYAxis &&
        computed.yTicks.map((t) => {
          const y = PAD.top + innerH - (t / computed.niceMax) * innerH
          return (
            <g key={`y-${t}`}>
              <line
                x1={PAD.left}
                x2={width - PAD.right}
                y1={y}
                y2={y}
                stroke={GRID}
                strokeWidth={1}
                strokeDasharray={t === 0 ? undefined : '2 5'}
              />
              <text
                x={PAD.left - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill={MUTED}
                fontFamily={FONT}
              >
                {formatAxis(t)}
              </text>
            </g>
          )
        })}

      <path
        d={computed.areaPath}
        fill={`url(#area-${gradientId})`}
        className="motion-safe:animate-[fade-in_500ms_300ms_both_cubic-bezier(0.25,1,0.5,1)] motion-safe:opacity-0 motion-reduce:opacity-100"
      />

      <path
        ref={linePathRef}
        d={computed.linePath}
        fill="none"
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray={pathLength || undefined}
        strokeDashoffset={pathLength || undefined}
        className="motion-safe:animate-[draw-line_900ms_cubic-bezier(0.25,1,0.5,1)_forwards]"
      />

      {/* Peak marker */}
      <g
        className="motion-safe:animate-[fade-in_400ms_900ms_both_cubic-bezier(0.25,1,0.5,1)] motion-safe:opacity-0"
        aria-hidden
      >
        <circle
          cx={computed.points[computed.peakIndex].x}
          cy={computed.points[computed.peakIndex].y}
          r={5.5}
          fill={INK}
          opacity={0.12}
        />
        <circle
          cx={computed.points[computed.peakIndex].x}
          cy={computed.points[computed.peakIndex].y}
          r={3}
          fill={INK}
        />
      </g>

      {/* Hover guide + tooltip */}
      {hover && (
        <g aria-hidden pointerEvents="none">
          <line
            x1={hover.x}
            x2={hover.x}
            y1={PAD.top}
            y2={PAD.top + innerH}
            stroke={MUTED}
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.45}
          />
          <circle cx={hover.x} cy={hover.y} r={5} fill={INK} />
          <circle cx={hover.x} cy={hover.y} r={2} fill={SURFACE} />
          <Tooltip
            x={hover.x}
            y={hover.y}
            label={hover.label}
            value={`${formatValue(hover.value)}${unit ? ` ${unit}` : ''}`}
            sub={hover.sub}
            chartWidth={width}
          />
        </g>
      )}

      {showXAxis &&
        computed.points.map((p, i) => {
          const visible = computed.xLabelIndices.includes(i) || hoverIndex === i
          if (!visible) return null
          const isAccent = hoverIndex === i || i === computed.peakIndex
          return (
            <text
              key={`x-${i}`}
              x={p.x}
              y={height - 8}
              textAnchor="middle"
              fontSize="10"
              fill={isAccent ? INK : MUTED}
              fontWeight={isAccent ? 600 : 400}
              fontFamily={FONT}
            >
              {p.label}
            </text>
          )
        })}

      <rect
        ref={overlayRef}
        x={PAD.left}
        y={PAD.top}
        width={innerW}
        height={innerH}
        fill="transparent"
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseLeave={() => setHoverIndex(null)}
        onTouchStart={(e) => handleMove(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={() => setHoverIndex(null)}
        className="cursor-crosshair"
      />
    </svg>
  )
}

function Tooltip({
  x,
  y,
  label,
  value,
  sub,
  chartWidth,
}: {
  x: number
  y: number
  label: string
  value: string
  sub?: string
  chartWidth: number
}) {
  const tw = 150
  const th = sub ? 58 : 42
  const offsetX = x + tw / 2 + 8 > chartWidth ? -tw - 8 : 8
  const offsetY = y - th - 12 < 0 ? 12 : -th - 12

  return (
    <g transform={`translate(${x + offsetX}, ${y + offsetY})`}>
      <rect width={tw} height={th} rx={10} fill={INK} opacity={0.97} />
      <text x={12} y={17} fontSize="10" fill="oklch(72% 0.01 250)" fontFamily={FONT}>
        {label}
      </text>
      <text x={12} y={33} fontSize="14" fontWeight={600} fill={SURFACE} fontFamily={FONT}>
        {value}
      </text>
      {sub && (
        <text
          x={12}
          y={49}
          fontSize="11"
          fontWeight={500}
          fill="oklch(80% 0.01 250)"
          fontFamily={FONT}
        >
          {sub}
        </text>
      )}
    </g>
  )
}

/* ------------------------------ RadialGauge ------------------------------ */

/** A single-value ring (0–100). Animates fill on mount. Monochrome. */
export function RadialGauge({
  value,
  caption,
  size = 148,
  stroke = 13,
}: {
  value: number
  caption?: string
  size?: number
  stroke?: number
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const pct = Math.max(0, Math.min(100, Math.round(value)))
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const target = c * (1 - pct / 100)

  return (
    <div
      className="relative inline-grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={GRID} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={INK}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={mounted ? target : c}
          className="transition-[stroke-dashoffset] duration-[900ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
        />
      </svg>
      <div className="absolute flex flex-col items-center text-center">
        <span className="text-[1.75rem] font-bold leading-none tabular-nums text-graphite">
          {pct}%
        </span>
        {caption && <span className="mt-1 text-[11px] text-slate-6">{caption}</span>}
      </div>
    </div>
  )
}

/* -------------------------------- Donut ---------------------------------- */

export type DonutSegment = { key: string; label: string; value: number; color: string }

/** Multi-segment donut for categorical breakdowns. Colour is semantic here. */
export function Donut({
  segments,
  size = 148,
  stroke = 18,
  centerValue,
  centerLabel,
}: {
  segments: DonutSegment[]
  size?: number
  stroke?: number
  centerValue?: string
  centerLabel?: string
}) {
  const total = segments.reduce((s, x) => s + x.value, 0)
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r

  let acc = 0
  return (
    <div
      className="relative inline-grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={GRID} strokeWidth={stroke} />
        {total > 0 &&
          segments.map((s) => {
            const frac = s.value / total
            const dash = frac * c
            const seg = (
              <circle
                key={s.key}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={stroke}
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={-acc}
              />
            )
            acc += dash
            return seg
          })}
      </svg>
      {(centerValue || centerLabel) && (
        <div className="absolute flex flex-col items-center text-center">
          {centerValue && (
            <span className="text-2xl font-bold leading-none tabular-nums text-graphite">
              {centerValue}
            </span>
          )}
          {centerLabel && <span className="mt-1 text-[11px] text-slate-6">{centerLabel}</span>}
        </div>
      )}
    </div>
  )
}

/* --------------------------- geometry helpers ---------------------------- */

function straightPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return ''
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
}

function catmullRomPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return ''
  if (points.length < 3) return straightPath(points)
  let path = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const tension = 6
    const cp1x = p1.x + (p2.x - p0.x) / tension
    const cp1y = p1.y + (p2.y - p0.y) / tension
    const cp2x = p2.x - (p3.x - p1.x) / tension
    const cp2y = p2.y - (p3.y - p1.y) / tension
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }
  return path
}

function niceCeiling(value: number): number {
  if (value <= 10) return Math.ceil(value / 5) * 5 || 5
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)))
  const norm = value / magnitude
  let nice
  if (norm <= 1) nice = 1
  else if (norm <= 2) nice = 2
  else if (norm <= 5) nice = 5
  else nice = 10
  return nice * magnitude
}

function buildYTicks(max: number, count: number): number[] {
  const step = max / count
  return Array.from({ length: count + 1 }, (_, i) => Math.round(i * step))
}

function pickXLabelIndices(count: number, maxLabels: number): number[] {
  if (count <= maxLabels) return Array.from({ length: count }, (_, i) => i)
  const last = count - 1
  const indices = new Set<number>([0, last])
  const slots = maxLabels - 1
  for (let i = 1; i < slots; i++) indices.add(Math.round((i / slots) * last))
  return [...indices].sort((a, b) => a - b)
}

function formatAxis(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`
  return String(n)
}
