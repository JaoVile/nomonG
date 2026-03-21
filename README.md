# nomonG backend

API backend for the `gnostart` map frontend.

## Stack

- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL (cloud or local)

## 1) Environment

Create `.env` from `.env.example` and set your real values:

```env
NODE_ENV=development
PORT=3333
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
CORS_ORIGIN=http://localhost:5173
DEFAULT_MAP_ID=default_map
DEFAULT_MAP_NAME=Mapa Interno
DEFAULT_MAP_EVENT_NAME=GPS Interno
DEFAULT_MAP_OVERLAY_URL=/maps/mapa_geral.svg
GOOGLE_MAPS_API_KEY=
GOOGLE_EVENT_PLACE_ID=
GOOGLE_EVENT_LABEL=Porto Digital Caruaru
GOOGLE_EVENT_LAT=-8.282803001403982
GOOGLE_EVENT_LNG=-35.9658650714576
GOOGLE_EVENT_RADIUS_METERS=180
GOOGLE_RESPONSE_LANGUAGE=pt-BR
```

## 2) Install and setup

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## 3) Run

```bash
npm run dev
```

Production:

```bash
npm run build
npm start
```

## API contract

- `GET /health`
- `GET /api/v1/map/bootstrap?mapId=default_map&includeGraph=false&includePois=false`
- `POST /api/v1/location/context`
- `POST /api/v1/pois` (returns `410 Gone`; admin mode removed)
- `PATCH /api/v1/pois/:id` (returns `410 Gone`; admin mode removed)
- `DELETE /api/v1/pois/:id` (returns `410 Gone`; admin mode removed)
- `PUT /api/v1/map/agenda-links` (returns `410 Gone`; admin mode removed)
- `POST /api/v1/pois/:id/access`

## Frontend integration

In `gnostart/.env.local`:

```env
VITE_MAP_ID=default_map
VITE_ENABLE_BACKEND_POIS=false
```

`VITE_API_BASE_URL` is optional.

- Local development: leave it empty and use the Vite proxy to `http://127.0.0.1:3333`.
- Frontend and backend on different origins: set `VITE_API_BASE_URL=https://api.seu-dominio.com`.
- Same-origin VPS: keep it empty and reverse-proxy `/api` and `/health` to the backend.

## VPS checklist

- Serve the frontend over HTTPS. Browser geolocation does not work reliably over plain HTTP.
- Reverse-proxy `/api` and `/health` to the backend running on port `3333`.
- Keep the frontend on the same origin when possible and leave `VITE_API_BASE_URL` empty in this setup.
- Keep `GOOGLE_EVENT_LAT`, `GOOGLE_EVENT_LNG` and `GOOGLE_EVENT_RADIUS_METERS` aligned with the real event area.
- If you want address resolution and external walking routes, configure `GOOGLE_MAPS_API_KEY`.
- The backend now re-syncs the `default_map` metadata on bootstrap, so overlay and bounds stay aligned with the deployed config.

