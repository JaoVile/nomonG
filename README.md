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
ADMIN_API_KEY=change_me
CORS_ORIGIN=http://localhost:5173
DEFAULT_MAP_ID=default_map
DEFAULT_MAP_NAME=Mapa Interno
DEFAULT_MAP_EVENT_NAME=GPS Interno
DEFAULT_MAP_OVERLAY_URL=/maps/mapa-visual.png
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
- `GET /api/v1/map/bootstrap?mapId=default_map&includeGraph=false`
- `POST /api/v1/pois` (requires header `x-admin-key`)
- `PATCH /api/v1/pois/:id` (requires header `x-admin-key`)
- `DELETE /api/v1/pois/:id` (requires header `x-admin-key`)
- `POST /api/v1/pois/:id/access`

## Frontend integration

In `gnostart/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:3333
VITE_MAP_ID=default_map
VITE_ADMIN_API_KEY=<same value as ADMIN_API_KEY>
```

