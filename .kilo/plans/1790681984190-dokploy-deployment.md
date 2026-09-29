# Deploy Flight-Ticket-Tracker to Dokploy

## Context

SkyCrawler is a **Nuxt 4 SSR app with Nitro server routes** (`server/api/flights.ts`, `hotels.ts`,
`hotels-autocomplete.ts`, `locations.ts`) that call SerpApi at request time. A static export
(`nuxt generate`) would drop the API routes, so it must run as a long-lived Node server.

Current gaps blocking a deploy:
- No `Dockerfile` / `.dockerignore` — Dokploy has nothing to build.
- `nuxt.config.ts:9` reads `process.env.SERPAPI_KEY` at config-evaluation time, i.e. **during the
  Docker build**, which bakes the secret into an image layer and forces a rebuild to rotate it.
- No health endpoint for Dokploy's health check.
- `devtools.enabled: true` ships on in production.
- README is still the Nuxt starter boilerplate.

## Decisions

| Decision | Choice |
|---|---|
| Build method | Custom multi-stage Dockerfile |
| SerpApi key | Runtime-only via `NUXT_SERP_API_KEY` (never a build arg) |
| Exposure | Dokploy domain + Traefik-managed Let's Encrypt |
| Source | `github.com/HendrixNguyen/Flight-Ticket-Tracker` (public, user-controlled) |
| Runtime port | `3000` |

## Tasks

### 1. `.dockerignore`
Exclude `node_modules`, `.nuxt`, `.output`, `.data`, `.env`, `.env.*`, `.git`, `docs`, `scratch`,
`*.log`, `.kilo`, `README.md`. Keeps build context small and guarantees no local `.env` leaks in.

### 2. `Dockerfile` (new, repo root)
```dockerfile
FROM oven/bun:1.2 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NITRO_HOST=0.0.0.0 \
    NITRO_PORT=3000
COPY --from=build /app/.output ./.output
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```
- Builder uses Bun to match `bun.lock`; `--frozen-lockfile` fails the build on lockfile drift.
- Runtime stage copies only `.output` — no `node_modules`, no source, no toolchain.
- `USER node` drops root. `NITRO_HOST=0.0.0.0` is required; Nitro defaults to localhost and Traefik
  will get connection-refused.
- Add `server/api/health.ts` returning `{ status: 'ok' }` for the Dokploy health check path.

### 3. `nuxt.config.ts` — remove the build-time secret read
Change line 9 to `serpApiKey: ''`. Nitro then populates it at boot from `NUXT_SERP_API_KEY`.
Also set `devtools: { enabled: false }` (or gate on `import.meta.dev`).
Update `.env.example` to `NUXT_SERP_API_KEY="your_serpapi_key_here"` so local dev uses the same
mechanism as production. `.gitignore` already covers `.env*`.

> `serpApiKey` sits at the top level of `runtimeConfig`, not under `public`, so it stays server-side
> and is never serialized into the client payload. Keep it that way.

### 4. README — replace boilerplate with real setup + deploy docs
Prereqs, `.env` setup, dev/build/preview, required env vars, and a Dokploy deploy section
(Dockerfile build type, port 3000, `NUXT_SERP_API_KEY` env var, health path `/api/health`).

### 5. Push the branch
`Dockerfile`, `.dockerignore`, `nuxt.config.ts`, `.env.example`, `server/api/health.ts`, `README.md`.
Nothing is committed by the planning agent — the user commits and pushes.

## Dokploy setup (user-run, ~10 min)

1. **Domain** — A record for the chosen hostname → Dokploy server public IP. Wait for DNS to
   propagate; Traefik's ACME challenge fails on an unresolvable domain.
2. **Create Application** → `Git` provider → pick
   `HendrixNguyen/Flight-Ticket-Tracker`, branch `main`.
   - Repo is public, so an anonymous clone works. Optionally install the Dokploy GitHub App for
     branch/PR-triggered deploys.
3. **Build** — Build Type `Dockerfile`, Dockerfile path `/Dockerfile` (leave Context empty so the
   build context is the repo root).
4. **Port** — set `3000`.
5. **Health check** — Path `/api/health`, Port `3000`. This one is mandatory to omit nothing: a
   container listening on localhost instead of `0.0.0.0` will pass the port check and fail every
   request, so verify the health path turns green before trusting it.
6. **Environment** — `NUXT_SERP_API_KEY=<real key>`. Do **not** set `SERPAPI_KEY`; after task 3 it
   is no longer read. Never add it as a build arg.
7. **Domains** tab — add the hostname, enable HTTPS. Traefik issues the Let's Encrypt cert.
8. **Deploy**.

## Validation

- Locally before pushing: `docker build -t skycrawler .` then
  `docker run -e NUXT_SERP_API_KEY=<key> -p 3000:3000 skycrawler` and confirm
  `curl -s localhost:3000/api/health` returns `{"status":"ok"}`.
- On the server: `curl -s https://<domain>/api/health`.
- End-to-end: load `/`, search a flight, and load `/hotels` and search a hotel. If results come back
  as the hardcoded mock lists from `hotels.ts:134` / `locations.ts:34`, the key is not reaching the
  server — re-check the env var name (`NUXT_SERP_API_KEY`, not `SERPAPI_KEY`) and force a **redeploy**
  (env changes do not hot-restart the container).
- Confirm no secret is in the image: `docker history <image>` should show no build arg.

## Risks

- **Flights have no mock fallback** — `flights.ts:19` hard-errors without a key, unlike hotels and
  locations. A missing key yields a visibly broken homepage, which is a good canary.
- **SerpApi billing** — every search page hit costs a call against a metered key. Consider putting
  rate limiting on `/api/*` if the domain is public.
- **Dokploy env changes require a redeploy**, not just a restart.

## Open Questions

- Target hostname?
- Is a reverse proxy / Cloudflare already in front of the Dokploy server?
