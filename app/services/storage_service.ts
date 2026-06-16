import { readFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { Exception } from '@adonisjs/core/exceptions'
import type { MultipartFile } from '@adonisjs/core/bodyparser'
import env from '#start/env'

/**
 * Domain error carrying an HTTP status (controllers turn it into a response).
 */
export class StorageError extends Exception {}

/**
 * Uploads images to a PUBLIC Supabase Storage bucket via its REST API (no extra
 * dependency — uses global fetch). Returns the public URL to store on the model.
 *
 * Required env: SUPABASE_URL, SUPABASE_SERVICE_KEY. Bucket defaults to 'uploads'
 * and must exist and be marked public in the Supabase dashboard.
 */
export default class StorageService {
  private get baseUrl() {
    return env.get('SUPABASE_URL')?.replace(/\/+$/, '')
  }
  private get serviceKey() {
    return env.get('SUPABASE_SERVICE_KEY')
  }
  private get bucket() {
    return env.get('SUPABASE_BUCKET') ?? 'uploads'
  }

  get isConfigured() {
    return Boolean(this.baseUrl && this.serviceKey)
  }

  /**
   * Upload a validated image file. `folder` namespaces the object key
   * (e.g. 'spaces', 'teams'). Returns the public URL.
   */
  async uploadImage(file: MultipartFile, folder: string): Promise<string> {
    if (!this.isConfigured) {
      throw new StorageError('El almacenamiento de imágenes no está configurado', {
        status: 503,
        code: 'E_STORAGE_NOT_CONFIGURED',
      })
    }
    if (!file.tmpPath) {
      throw new StorageError('Archivo inválido', { status: 422, code: 'E_INVALID_FILE' })
    }

    const ext = (file.extname || 'jpg').toLowerCase()
    const key = `${folder}/${randomUUID()}.${ext}`
    const body = await readFile(file.tmpPath)
    const contentType = file.headers['content-type'] || `image/${ext === 'jpg' ? 'jpeg' : ext}`

    const res = await fetch(`${this.baseUrl}/storage/v1/object/${this.bucket}/${key}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.serviceKey}`,
        'apikey': this.serviceKey!,
        'Content-Type': contentType,
        'x-upsert': 'true',
        'cache-control': 'public, max-age=31536000',
      },
      body,
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new StorageError(`No se pudo subir la imagen (${res.status}) ${detail}`.trim(), {
        status: 502,
        code: 'E_STORAGE_UPLOAD_FAILED',
      })
    }

    return `${this.baseUrl}/storage/v1/object/public/${this.bucket}/${key}`
  }
}
