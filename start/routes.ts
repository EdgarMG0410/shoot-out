/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| Three surfaces share this app:
|  - JSON API (mobile app)      → `api` access-tokens guard   (root paths)
|  - Client web experience      → `web` session guard         (/app/*)
|  - Inertia admin dashboard    → `web` session + role:admin  (/dashboard/*)
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AuthController = () => import('#controllers/auth_controller')
const SpacesController = () => import('#controllers/spaces_controller')
const BookingsController = () => import('#controllers/bookings_controller')
const AdminController = () => import('#controllers/admin_controller')
const LocationsController = () => import('#controllers/locations_controller')
const EventsController = () => import('#controllers/events_controller')

const SessionController = () => import('#controllers/session_controller')
const ClientController = () => import('#controllers/client_controller')
const DashboardController = () => import('#controllers/dashboard_controller')
const DashboardSpacesController = () => import('#controllers/dashboard/spaces_controller')
const DashboardBookingsController = () => import('#controllers/dashboard/bookings_controller')
const DashboardLocationsController = () => import('#controllers/dashboard/locations_controller')
const DashboardEventsController = () => import('#controllers/dashboard/events_controller')
const DashboardLeaguesController = () => import('#controllers/dashboard/leagues_controller')
const DashboardTeamsController = () => import('#controllers/dashboard/teams_controller')
const DashboardPlayersController = () => import('#controllers/dashboard/players_controller')
const DashboardMatchesController = () => import('#controllers/dashboard/matches_controller')

/*
|--------------------------------------------------------------------------
| JSON API (mobile app) — access-tokens guard
|--------------------------------------------------------------------------
*/

router.post('/register', [AuthController, 'register'])
router.post('/login', [AuthController, 'login'])
router.post('/logout', [AuthController, 'logout']).use(middleware.auth({ guards: ['api'] }))
router.get('/me', [AuthController, 'me']).use(middleware.auth({ guards: ['api'] }))

// Public spaces, locations & events
router.get('/spaces', [SpacesController, 'index'])
router.get('/spaces/:id', [SpacesController, 'show'])
router.get('/spaces/:id/availability', [SpacesController, 'availability'])
router.get('/locations', [LocationsController, 'index'])
router.get('/locations/:id', [LocationsController, 'show'])
router.get('/events', [EventsController, 'index'])
router.get('/events/:id', [EventsController, 'show'])

// Authenticated user bookings
router
  .group(() => {
    router.post('/bookings', [BookingsController, 'store'])
    router.post('/bookings/:id/pay', [BookingsController, 'pay'])
    router.get('/bookings/me', [BookingsController, 'mine'])
  })
  .use(middleware.auth({ guards: ['api'] }))

// Admin API
router
  .group(() => {
    router.post('/spaces', [SpacesController, 'store'])
    router.put('/spaces/:id', [SpacesController, 'update'])
    router.delete('/spaces/:id', [SpacesController, 'destroy'])
    router.post('/admin/spaces/:id/block', [SpacesController, 'block'])
    router.get('/admin/bookings', [AdminController, 'bookings'])
    router.get('/admin/revenue', [AdminController, 'revenue'])

    router.post('/locations', [LocationsController, 'store'])
    router.put('/locations/:id', [LocationsController, 'update'])
    router.delete('/locations/:id', [LocationsController, 'destroy'])

    router.post('/events', [EventsController, 'store'])
    router.put('/events/:id', [EventsController, 'update'])
    router.delete('/events/:id', [EventsController, 'destroy'])
  })
  .use([middleware.auth({ guards: ['api'] }), middleware.role({ role: 'admin' })])

/*
|--------------------------------------------------------------------------
| Web — root + session auth (shared by clients and admins)
|--------------------------------------------------------------------------
*/

router.get('/', ({ auth, response }) => {
  if (!auth.isAuthenticated) return response.redirect().toPath('/auth/login')
  return response.redirect().toPath(auth.user!.role === 'admin' ? '/dashboard' : '/app')
})

router
  .group(() => {
    router.get('/auth/login', [SessionController, 'showLogin']).as('login')
    router.post('/auth/login', [SessionController, 'login']).as('login.store')
    router.get('/auth/register', [SessionController, 'showRegister']).as('register')
    router.post('/auth/register', [SessionController, 'register']).as('register.store')
  })
  .use(middleware.guest())

/*
|--------------------------------------------------------------------------
| Client web experience — /app (any authenticated user)
|--------------------------------------------------------------------------
*/

router
  .group(() => {
    router.post('/auth/logout', [SessionController, 'destroy']).as('logout')

    router.get('/app', [ClientController, 'home']).as('app')
    router.get('/app/bookings', [ClientController, 'bookings']).as('app.bookings')
    router.post('/app/bookings', [ClientController, 'book']).as('app.book')
    router.post('/app/bookings/:id/pay', [ClientController, 'pay']).as('app.pay')
    router.get('/app/spaces/:id', [ClientController, 'space']).as('app.space')
  })
  .use(middleware.auth({ guards: ['web'] }))

/*
|--------------------------------------------------------------------------
| Admin dashboard — /dashboard (role: admin)
|--------------------------------------------------------------------------
*/

router
  .group(() => {
    router.get('/dashboard', [DashboardController, 'index']).as('dashboard')

    router.get('/dashboard/spaces', [DashboardSpacesController, 'index']).as('dashboard.spaces')
    router.post('/dashboard/spaces', [DashboardSpacesController, 'store']).as('dashboard.spaces.store')
    router.put('/dashboard/spaces/:id', [DashboardSpacesController, 'update']).as('dashboard.spaces.update')
    router.delete('/dashboard/spaces/:id', [DashboardSpacesController, 'destroy']).as('dashboard.spaces.destroy')
    router.post('/dashboard/spaces/:id/block', [DashboardSpacesController, 'block']).as('dashboard.spaces.block')

    router.get('/dashboard/bookings', [DashboardBookingsController, 'index']).as('dashboard.bookings')

    router.get('/dashboard/locations', [DashboardLocationsController, 'index']).as('dashboard.locations')
    router.get('/dashboard/locations/:id/edit', [DashboardLocationsController, 'edit']).as('dashboard.locations.edit')
    router.post('/dashboard/locations', [DashboardLocationsController, 'store']).as('dashboard.locations.store')
    router.put('/dashboard/locations/:id', [DashboardLocationsController, 'update']).as('dashboard.locations.update')
    router.delete('/dashboard/locations/:id', [DashboardLocationsController, 'destroy']).as('dashboard.locations.destroy')

    router.get('/dashboard/events', [DashboardEventsController, 'index']).as('dashboard.events')
    router.post('/dashboard/events', [DashboardEventsController, 'store']).as('dashboard.events.store')
    router.put('/dashboard/events/:id', [DashboardEventsController, 'update']).as('dashboard.events.update')
    router.delete('/dashboard/events/:id', [DashboardEventsController, 'destroy']).as('dashboard.events.destroy')

    // Ligas
    router.get('/dashboard/leagues', [DashboardLeaguesController, 'index']).as('dashboard.leagues')
    router.post('/dashboard/leagues', [DashboardLeaguesController, 'store']).as('dashboard.leagues.store')
    router.get('/dashboard/leagues/:id', [DashboardLeaguesController, 'show']).as('dashboard.leagues.show')
    router.put('/dashboard/leagues/:id', [DashboardLeaguesController, 'update']).as('dashboard.leagues.update')
    router.delete('/dashboard/leagues/:id', [DashboardLeaguesController, 'destroy']).as('dashboard.leagues.destroy')

    router.post('/dashboard/leagues/:leagueId/teams', [DashboardTeamsController, 'store']).as('dashboard.teams.store')
    router.put('/dashboard/teams/:id', [DashboardTeamsController, 'update']).as('dashboard.teams.update')
    router.delete('/dashboard/teams/:id', [DashboardTeamsController, 'destroy']).as('dashboard.teams.destroy')

    router.post('/dashboard/teams/:teamId/players', [DashboardPlayersController, 'store']).as('dashboard.players.store')
    router.put('/dashboard/players/:id', [DashboardPlayersController, 'update']).as('dashboard.players.update')
    router.delete('/dashboard/players/:id', [DashboardPlayersController, 'destroy']).as('dashboard.players.destroy')

    router.post('/dashboard/leagues/:leagueId/matches', [DashboardMatchesController, 'store']).as('dashboard.matches.store')
    router.put('/dashboard/matches/:id', [DashboardMatchesController, 'update']).as('dashboard.matches.update')
    router.delete('/dashboard/matches/:id', [DashboardMatchesController, 'destroy']).as('dashboard.matches.destroy')
    router.post('/dashboard/matches/:id/events', [DashboardMatchesController, 'addEvent']).as('dashboard.matches.events.store')
    router.delete('/dashboard/match-events/:eventId', [DashboardMatchesController, 'removeEvent']).as('dashboard.matchevents.destroy')
  })
  .use([middleware.auth({ guards: ['web'] }), middleware.role({ role: 'admin' })])
