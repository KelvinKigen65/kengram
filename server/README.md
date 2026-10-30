# Roamly API foundation

This package is the Node/TypeScript business boundary for Roamly. It owns
authorization, trip lifecycle changes, generation jobs, public share projections,
and durable PostgreSQL data; mobile clients must not write canonical trip data.

## Current foundation

- `src/config.ts` validates all privileged configuration before startup and never
  includes secret values in errors.
- `src/app.ts` exposes a dependency-free `GET /health` handler for deployment
  probes. `src/http.ts` adapts it to Fastify without moving authorization or
  lifecycle decisions into route wiring.
- `prisma/schema.prisma` is the canonical persistence model. It deliberately
  stores POI snapshots with source/freshness/attribution fields, not live booking
  claims.

## Local setup (after workspace dependencies are installed)

1. Copy `.env.example` to `.env` and replace every placeholder.
2. Run `npm install` from `server/`.
3. Run `npm run db:generate`, then create the initial migration with `npm run db:migrate`.
4. Run `npm run typecheck`.

`PUBLIC_APP_URL` may use the `roamly://app` app URL. `SUPABASE_SERVICE_ROLE_KEY`,
AI keys, and Mapbox tokens are server-only and must never be shipped to Expo.

The schema intentionally leaves database-backed job workers, provider adapters,
and endpoint modules for their focused implementation phases. Do not expose the
service-role key to a client or bypass lifecycle/role checks through direct DB
writes.
