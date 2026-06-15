import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const migrations = {
  naturalSort: true,
  paths: ['database/migrations'],
}

const credentials = {
  host: env.get('DB_HOST'),
  port: env.get('DB_PORT'),
  user: env.get('DB_USER'),
  password: env.get('DB_PASSWORD'),
  database: env.get('DB_DATABASE'),
}

// Managed hosts (Render, etc.) provide a single connection string.
const databaseUrl = env.get('DATABASE_URL')

const dbConfig = defineConfig({
  connection: (env.get('DB_CONNECTION', 'mysql') as 'mysql' | 'postgres'),
  connections: {
    mysql: {
      client: 'mysql2',
      connection: credentials,
      migrations,
    },
    postgres: {
      client: 'pg',
      connection: databaseUrl
        ? { connectionString: databaseUrl, ssl: { rejectUnauthorized: false } }
        : credentials,
      migrations,
    },
  },
})

export default dbConfig
