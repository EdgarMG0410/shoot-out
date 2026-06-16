import type { HttpContext } from '@adonisjs/core/http'
import StorageService, { StorageError } from '#services/storage_service'

const FOLDERS = ['spaces', 'locations', 'teams', 'misc'] as const
type Folder = (typeof FOLDERS)[number]

/**
 * Admin image uploads. Receives a single multipart file under `file`, pushes it
 * to Supabase Storage and returns its public URL as JSON. The React
 * <ImageUpload> component calls this, then stores the URL on the parent form.
 */
export default class DashboardUploadsController {
  async store({ request, response }: HttpContext) {
    const folderInput = request.input('folder', 'misc')
    const folder: Folder = (FOLDERS as readonly string[]).includes(folderInput)
      ? (folderInput as Folder)
      : 'misc'

    const file = request.file('file', {
      size: '5mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'],
    })

    if (!file) {
      return response.unprocessableEntity({ error: 'No se recibió ninguna imagen' })
    }
    if (!file.isValid) {
      return response.unprocessableEntity({ error: file.errors[0]?.message ?? 'Imagen inválida' })
    }

    try {
      const url = await new StorageService().uploadImage(file, folder)
      return response.created({ url })
    } catch (error) {
      if (error instanceof StorageError) {
        return response.status(error.status).send({ error: error.message })
      }
      throw error
    }
  }
}
