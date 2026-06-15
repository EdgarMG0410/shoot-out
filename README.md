# Shootout ⚽

Plataforma estilo Playtomic para rentar **espacios** deportivos. Una sola app
**AdonisJS 6** sirve tres superficies:

- **JSON API** (guard de _access tokens_) → app móvil.
- **Experiencia de cliente** (Inertia + React, sesión) → `/app` (rentadores).
- **Dashboard admin** (Inertia + React, sesión + rol admin) → `/dashboard`.

## Modelo de dominio

```
Location (locación / sede)
  └── Space (espacio)   type: cancha | terraza | otro
        ├── size (5|7|11, solo canchas) · pricePerHour · capacity
        ├── Booking  (renta por hora — cualquier tipo de espacio)
        └── Event    (torneo, fiesta, clase)
  └── Event (vive en un Space de la locación)

User  role: admin | user(rentador)   renterType: particular|liga|empresa|evento|otro
Booking → belongsTo Space, User · hasOne Payment
Block   → bloqueo de horario de un Space (admin)
```

Un **Space** unifica canchas y terrazas: al crearlo eliges el tipo. Todos los
espacios se rentan por hora y pueden alojar eventos. El chequeo de solape
considera reservas + bloqueos + eventos del espacio.

## Stack

| Capa       | Tecnología                                              |
| ---------- | ------------------------------------------------------- |
| Framework  | AdonisJS 6 (TypeScript, ESM)                            |
| ORM        | Lucid + MySQL                                           |
| Auth       | `@adonisjs/auth` — guards `api` (tokens) y `web` (sesión) |
| Validación | VineJS                                                  |
| UI         | Inertia + React 19 + Tailwind v4 (tema OKLCH)          |

## Requisitos

- Node.js **>= 24**
- MySQL en local (XAMPP/MAMP/MySQL server)

## Puesta en marcha

```bash
npm install

# Crea la base de datos en tu MySQL:  CREATE DATABASE shootout;
cp .env.example .env          # ajusta DB_USER / DB_PASSWORD / DB_DATABASE
node ace generate:key         # si APP_KEY está vacío

node ace migration:fresh --seed
npm run dev                   # http://localhost:3333
```

### Credenciales del seed

| Rol             | Email                | Password      |
| --------------- | -------------------- | ------------- |
| admin           | `admin@shootout.mx`  | `password123` |
| rentador (part.)| `player@shootout.mx` | `password123` |
| rentador (liga) | `liga@shootout.mx`   | `password123` |
| rentador (empr.)| `empresa@shootout.mx`| `password123` |

- **Cliente:** `http://localhost:3333/app` (cualquier rentador).
- **Admin:** `http://localhost:3333/dashboard` (solo admin).
- Raíz `/` redirige según el rol.

## Comandos

| Comando                          | Qué hace                       |
| -------------------------------- | ------------------------------ |
| `npm run dev`                    | Servidor dev con HMR           |
| `node ace migration:fresh --seed`| Reconstruye la DB y siembra    |
| `node ace migration:run`         | Corre migraciones pendientes   |
| `node ace db:seed`               | Corre los seeders              |
| `node ace build`                 | Build de producción            |
| `node ace list:routes`           | Lista todas las rutas          |

---

## API (app móvil) — guard `api`

Bearer token: `register`/`login` devuelven `token.token`; mándalo como
`Authorization: Bearer <token>`. Manda `Accept: application/json`.

### Auth
| Método | Ruta        | Auth | Descripción                         |
| ------ | ----------- | ---- | ----------------------------------- |
| POST   | `/register` | —    | Crea rentador y devuelve token      |
| POST   | `/login`    | —    | Login, devuelve token               |
| POST   | `/logout`   | sí   | Revoca el token actual              |
| GET    | `/me`       | sí   | Usuario autenticado                 |

### Público
| Método | Ruta                                       | Descripción                       |
| ------ | ------------------------------------------ | --------------------------------- |
| GET    | `/spaces?type=&maxPrice=&locationId=`      | Lista de espacios (filtros)       |
| GET    | `/spaces/:id`                              | Detalle                           |
| GET    | `/spaces/:id/availability?date=YYYY-MM-DD` | Reservas + bloqueos + eventos     |
| GET    | `/locations` · `/locations/:id`            | Locaciones con sus espacios       |
| GET    | `/events?locationId=&spaceId=&date=`       | Eventos                           |

### Rentador (auth)
| Método | Ruta                | Descripción                              |
| ------ | ------------------- | ---------------------------------------- |
| POST   | `/bookings`         | Reserva (valida solape, calcula precio)  |
| POST   | `/bookings/:id/pay` | Pago `fake_paid` → reserva `confirmed`   |
| GET    | `/bookings/me`      | Historial del rentador                   |

### Admin (rol admin)
| Método | Ruta                        | Descripción              |
| ------ | --------------------------- | ------------------------ |
| POST/PUT/DELETE | `/spaces` · `/spaces/:id` | CRUD de espacios   |
| POST   | `/admin/spaces/:id/block`   | Bloqueo de horario       |
| POST/PUT/DELETE | `/locations` · `/locations/:id` | CRUD locaciones |
| POST/PUT/DELETE | `/events` · `/events/:id` | CRUD eventos       |
| GET    | `/admin/bookings`           | Todas las reservas       |
| GET    | `/admin/revenue`            | Suma de pagos            |

```bash
# Login (guarda token.token)
curl -X POST localhost:3333/login -H Content-Type:application/json -H Accept:application/json \
  -d '{"email":"player@shootout.mx","password":"password123"}'

# Reservar
curl -X POST localhost:3333/bookings -H "Authorization: Bearer <TOKEN>" \
  -H Content-Type:application/json -H Accept:application/json \
  -d '{"spaceId":1,"date":"2026-07-10","startTime":"18:00","endTime":"19:30"}'
```

---

## Web (sesión)

| Área      | Rutas                                                        |
| --------- | ----------------------------------------------------------- |
| Auth      | `/auth/login`, `/auth/register`, `/auth/logout`             |
| Cliente   | `/app`, `/app/spaces/:id`, `/app/bookings` (+ reservar/pagar)|
| Dashboard | `/dashboard`, `/dashboard/{locations,spaces,events,bookings}`|

## Decisiones de diseño

- **Espacio unificado.** Canchas y terrazas son un mismo `Space` con `type`
  (cancha/terraza/otro). Más simple y extensible; reservas y eventos apuntan al
  espacio.
- **Dos guards en un `config/auth.ts`.** `web` (sesión, dashboard + cliente),
  `api` (tokens, móvil).
- **Lógica en servicios.** `BookingService` (solape en minutos + precio + tx con
  `FOR UPDATE`) y `EventService` (solape de eventos), fuera de los controllers.
- **CSRF** solo en superficies web (`/auth`, `/app`, `/dashboard`); el API por
  tokens queda exento (ver `config/shield.ts`).
- **Bloqueos** en tabla `blocks` aparte (no contaminan reservas/pagos).

## Estructura

```
app/
  controllers/        # API: auth, spaces, bookings, locations, events, admin
    dashboard/        # web admin: spaces, locations, events, bookings
  middleware/         # role_middleware (+ auth/guest/silent)
  models/             # user, location, space, booking, payment, block, event
  services/           # booking_service, event_service
  validators/         # auth, space, booking, event, location, block
database/migrations/  # users, access_tokens, locations, spaces, blocks, bookings, payments, events
database/seeders/     # main_seeder
inertia/              # React: layouts (dashboard, client), pages (auth, app, dashboard), components
start/                # routes.ts, kernel.ts
```
