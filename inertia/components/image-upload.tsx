import { useRef, useState } from 'react'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'
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

  const pick = () => inputRef.current?.click()

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
      <div className="flex items-start gap-3">
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
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      {error && <span className="text-[11px] font-medium text-rose-mark">{error}</span>}
    </div>
  )
}
