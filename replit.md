# WeatherAxis

Your local weather app — real-time forecasts, hourly and daily outlooks, air quality, and live rain radar for your location. No sign-in required.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/weather-checkins` — web app (React + Vite). Theme tokens in `src/index.css`; weather types in `src/hooks/use-weather.ts`; live rain radar in `src/components/weather-radar.tsx`.
- `artifacts/strata-mobile` — iOS Expo app (SDK 54). Home screen `app/(tabs)/index.tsx`; radar `app/(tabs)/radar.tsx` + `components/RadarMap.tsx`.
- `artifacts/api-server` — Express API. Routes in `src/routes/`; health contract from `@workspace/api-zod`.
- `lib/api-spec/openapi.yaml` — API contract source of truth; run codegen after edits.
- `lib/db/src/schema/index.ts` — DB schema barrel (currently empty; app reads live data, persists nothing).

## Architecture decisions

- No authentication anywhere. Sign-in (Clerk) was removed across web, mobile, and API.
- No neighbor-reports / corrections feature. Removed entirely (web UI, mobile tab, API routes, OpenAPI). Web `WeatherType` is a local union, decoupled from any generated correction schema.
- Weather data comes live from Open-Meteo (forecast/AQI) and NWS (US alerts); nothing is stored in the DB.
- Radar avoids reload churn: web uses a two-layer crossfade that pauses when offscreen/hidden; mobile builds the WebView HTML once and pushes GPS via `injectJavaScript` instead of reloading.

## Product

WeatherAxis / Strata is a kid-friendly local weather suite (web + iOS): current conditions, hourly and daily forecasts, weather alerts, air quality, "what to wear" guidance, and a live animated rain radar. No login — open it and it uses your location.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
