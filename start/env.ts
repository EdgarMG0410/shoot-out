/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring session package
  |----------------------------------------------------------
  */
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory'] as const),

  /*
  |----------------------------------------------------------
  | Variables for configuring database connection
  |----------------------------------------------------------
  | DB_CONNECTION picks the driver ('mysql' locally, 'postgres' on Render).
  | On managed hosts a single DATABASE_URL is provided; otherwise use DB_*.
  */
  DB_CONNECTION: Env.schema.enum.optional(['mysql', 'postgres'] as const),
  DATABASE_URL: Env.schema.string.optional(),
  DB_HOST: Env.schema.string.optional({ format: 'host' }),
  DB_PORT: Env.schema.number.optional(),
  DB_USER: Env.schema.string.optional(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | Supabase Storage (image uploads)
  |----------------------------------------------------------
  | Uploads (logos, fotos) go to a PUBLIC Supabase Storage bucket. Optional so
  | the app boots without them; uploads fail with a clear error until set.
  | SUPABASE_URL e.g. https://<project-ref>.supabase.co
  | SUPABASE_SERVICE_KEY = service_role key (server-side only, never exposed).
  */
  SUPABASE_URL: Env.schema.string.optional(),
  SUPABASE_SERVICE_KEY: Env.schema.string.optional(),
  SUPABASE_BUCKET: Env.schema.string.optional(),
})
