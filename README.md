# SkyCrawler

Flight and hotel search dashboard built with Nuxt 4, Vue 3 and Tailwind CSS v4. Live results come
from [SerpApi](https://serpapi.com) via server-side Nitro routes, so the SerpApi key is never exposed
to the browser.

## Requirements

- [Bun](https://bun.sh) (or Node.js 20.19+ / 22.12+)
- A SerpApi API key

## Setup

Install dependencies:

```bash
bun install
```

Create a local `.env` from the example and fill in your key:

```bash
cp .env.example .env
```

```dotenv
NUXT_SERP_API_KEY="your_serpapi_key_here"
```

`NUXT_SERP_API_KEY` is the runtime override for `runtimeConfig.serpApiKey` in `nuxt.config.ts`. The
same variable name works locally and in production.

## Development

```bash
bun run dev     # http://localhost:3000
```

## Production

```bash
bun run build   # emits .output/
bun run preview # serves the production build locally
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `NUXT_SERP_API_KEY` | Yes | SerpApi key. Without it, flight search errors and hotel/location search falls back to bundled mock data. |

Never pass this as a Docker build argument - build args are baked into image layers. Set it as a
runtime environment variable.

## Deploying to Dokploy

The app is server-rendered with Nitro API routes, so it must run as a Node server. It cannot be
deployed as a static site (`nuxt generate` would drop `/api/*`).

### 1. DNS

Add an A record for your hostname pointing at the Dokploy server's public IP. Wait for it to resolve
before deploying - Traefik's ACME challenge fails against an unresolvable domain.

### 2. Create the application

In Dokploy: **Apps → Create → Application → Git**.

- **Repository**: `HendrixNguyen/Flight-Ticket-Tracker` (public, so an anonymous clone works)
- **Branch**: `main`

### 3. Configure the build

| Setting | Value |
|---|---|
| Build Type | `Dockerfile` |
| Dockerfile path | `/Dockerfile` |
| Docker context | leave empty (repo root) |
| Port | `3000` |
| Health check path | `/api/health` |
| Health check port | `3000` |

### 4. Environment

Add `NUXT_SERP_API_KEY` with your key. Do **not** set `SERPAPI_KEY`; it is no longer read.

Environment changes require a **redeploy**, not just a restart.

### 5. Domain and TLS

On the **Domains** tab, add your hostname and enable HTTPS. Dokploy's Traefik provisions a Let's
Encrypt certificate automatically.

### 6. Deploy

Verify once it is green:

```bash
curl -s https://your-domain/api/health   # {"status":"ok"}
```

Then load the homepage and run a flight search, and load `/hotels` and search a hotel. Flight search
has no mock fallback, so a key that failed to load shows up immediately as an error on the homepage.

## Deployment notes

- The runtime image runs as the non-root `node` user and binds `0.0.0.0`. Nitro defaults to
  localhost, which Traefik cannot reach.
- Only `.output` is copied into the final image - no source, dev dependencies or build toolchain.
- Every SerpApi call is billed. Put rate limiting in front of `/api/*` if the domain is public.
