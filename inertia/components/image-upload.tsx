import { useRef, useState } from 'react'
import { ImagePlus, Link2, Loader2, Trash2 } from 'lucide-react'
import { Photo } from '~/components/ui'
import { cn } from '~/lib/utils'

/** Read the XSRF token Shield set as a cookie, to authorize the fetch upload. */
function xsrfToken(): string {
  const m = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)
  return m ? decodeURIComponent(m[1]) : ''
}

type Props = {
  /** Current image URL (the form field value). */
  value: string | null
  /** Called with the new public URL after upload, or null when cleared. */
  onChange: (url: string | null) => void
  /** Storage folder namespace: 'spaces' | 'locations' | 'teams' | 'misc'. */
  folder?: 'spaces' | 'locations' | 'teams' | 'misc'
  /** Preview aspect — square for logos, video (16:9) for cover photos. */
  aspect?: 'square' | 'video'
  className?: string
}

/**
 * Reusable image picker that uploads to Supabase Storage (via /dashboard/uploads)
 * and reports back the public URL. Shows a live preview with replace/remove.
 */
export function ImageUpload({
  value,
  onChange,
  folder = 'misc',
  aspect = 'video',
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUrl, setShowUrl] = useState(false)
  const [urlDraft, setUrlDraft] = useState('')

  const pick = () => inputRef.current?.click()

  const useUrl = () => {
    const url = urlDraft.trim()
    if (!url) return
    if (!/^https?:\/\/.+/i.test(url)) {
      setError('Pega una URL válida que empiece con http(s)://')
      return
    }
    setError(null)
    onChange(url)
    setUrlDraft('')
    setShowUrl(false)
  }

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file
    if (!file) return

    setError(null)
    setUploading(true)
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('folder', folder)
      const res = await fetch('/dashboard/uploads', {
        method: 'POST',
        headers: { 'X-XSRF-TOKEN': xsrfToken(), 'Accept': 'application/json' },
        body,
      })
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
      if (!res.ok || !data.url) throw new Error(data.error || 'No se pudo subir la imagen')
      onChange(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        <Photo
          src={value}
          alt="Vista previa"
          className={cn(
            'w-28 shrink-0 rounded-xl border border-bone-3',
            aspect === 'square' ? 'aspect-square' : 'aspect-video w-40'
          )}
        />
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={pick}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-bone-3 bg-chalk px-3 py-1.5 text-sm font-medium text-graphite transition-colors hover:bg-bone-2 disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ImagePlus className="size-4" />
            )}
            {uploading ? 'Subiendo…' : value ? 'Cambiar imagen' : 'Subir imagen'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowUrl((v) => !v)
              setError(null)
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-6 transition-colors hover:text-graphite"
          >
            <Link2 className="size-3.5" /> Usar una URL
          </button>
          {value && !uploading && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-6 transition-colors hover:text-rose-mark"
            >
              <Trash2 className="size-3.5" /> Quitar
            </button>
          )}
          <span className="text-[11px] text-slate-6/80">JPG, PNG, WEBP · máx 5 MB</span>
        </div>
      </div>

      {showUrl && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), useUrl())}
            placeholder="https://…/foto.jpg"
            className="h-9 w-full rounded-lg border border-bone-3 bg-bone-1 px-3 text-sm text-graphite placeholder:text-slate-6/60 focus-visible:border-lime-deep"
            autoFocus
          />
          <button
            type="button"
            onClick={useUrl}
            className="shrink-0 rounded-lg bg-graphite px-3 text-sm font-medium text-chalk transition-colors hover:bg-graphite-2"
          >
            Usar
          </button>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      {error && (
        <div className="flex items-start gap-1.5 rounded-lg border border-rose-mark/30 bg-rose-mark/10 px-3 py-2 text-xs font-medium text-rose-mark">
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
