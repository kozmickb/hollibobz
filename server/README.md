# Odysync Server

## Railway Deployment

### Required Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (use Railway's private variable reference to the Postgres service)
- `NODE_ENV` - Set to `production` for production deployments
- `PORT` - Server port (default: 3000)
- `CORS_ORIGINS` - Comma-separated list of allowed CORS origins (e.g., `https://hollibobz-production.up.railway.app,https://expo.dev`)

### Optional Environment Variables

- `SERVICE_NAME` - Service name for logging (default: `odysync`)
- `GIT_COMMIT` - Git commit hash for health endpoint
- `METRICS_TOKEN` - Bearer token for metrics endpoint authentication
- `DB_WAIT_RETRIES` - Number of DB connection retries (default: 20)
- `DB_WAIT_DELAY_MS` - Delay between DB retries in ms (default: 1500)

### API Keys (Optional)

- `AVIATIONSTACK_API_KEY` - AviationStack API key for flight data
- `AERODATABOX_RAPIDAPI_KEY` - AeroDataBox RapidAPI key
- `AERODATABOX_RAPIDAPI_HOST` - AeroDataBox RapidAPI host
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `DEEPSEEK_API_KEY` - DeepSeek API key for AI features
- `XAI_API_KEY` - xAI API key for AI features

### Environment Configuration

The application uses `envalid` for environment variable validation. All environment variables are validated at startup with appropriate defaults. See `server/.env.example` for a complete list of all environment variables.

**Environment Validator**: `server/src/config/env.ts` - validates all environment variables and provides type-safe access.

### Railway Configuration

- **Root Directory**: `server`
- **Install Command**: `npm ci`
- **Build Command**: `npm run build`
- **Start Command**: `npm run start:railway`
- **Health Check Path**: `/api/health`

### Railway (Dockerfile) Deploy

Railway will automatically detect the root `Dockerfile` and use it for building and deploying the service. This approach uses a two-stage Docker build with Node 20, ensuring:

- **Build Stage**: 
  - Installs dependencies with `PRISMA_SKIP_POSTINSTALL_GENERATE=1` to avoid schema errors
  - Copies Prisma schema and source code
  - Generates Prisma client explicitly with `npx prisma generate --schema=./prisma/schema.prisma`
  - Builds TypeScript to `dist/`
  - Prunes dev dependencies for smaller runtime image
- **Runtime Stage**: 
  - Uses only production dependencies and includes the Prisma CLI for migrations
  - Runs as non-root user for security
  - **Start Command**: `node dist/boot.js` - runs migrations then starts server

The Dockerfile approach provides deterministic builds and eliminates Prisma schema-not-found errors during `npm ci`.

### Railway Deployment Commands

```bash
npm ci
npm run build
npm run start:railway
```

### Local Development

```bash
npm install
npm run build
npm start
```

### CI/CD Requirements

The project includes GitHub Actions CI that runs on PRs and main pushes:

```bash
# Run the same checks locally
npm run build
npx prisma validate --schema=./prisma/schema.prisma
npm test  # if tests exist
```

### Production Features

- **Automatic Prisma Migrations**: Boot script runs `prisma migrate deploy` before starting
- **Fallback Migration**: If migrations fail, falls back to `prisma db push --accept-data-loss`
- **Database Health Checks**: `/api/health` endpoint verifies database connectivity
- **Security Hardening**: Helmet, Morgan logging, CORS allowlist, and rate limiting
- **Request Tracing**: Request ID middleware with UUID generation
- **Structured Logging**: JSON logging with secret sanitization
- **Prometheus Metrics**: `/api/metrics` endpoint with authentication
- **Environment-Based Config**: Development vs production settings

### Health Check

The API provides a health check endpoint at `/api/health` that returns JSON with database connectivity status:

```json
{
  "ok": true,
  "uptimeSec": 123,
  "commit": "abc123def456",
  "db": {
    "ok": true,
    "latencyMs": 15
  },
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

### Metrics Endpoint

The API provides a Prometheus metrics endpoint at `/api/metrics`:

**Authentication**: Requires `Authorization: Bearer <METRICS_TOKEN>` header

**Local Testing**:
```bash
curl -H "Authorization: Bearer your-metrics-token" http://localhost:3000/api/metrics
```

**Railway Testing**:
```bash
curl -H "Authorization: Bearer your-metrics-token" https://hollibobz-production.up.railway.app/api/metrics
```

**Content-Type**: `text/plain; version=0.0.4`

### Prisma Configuration

- **Schema Location**: `prisma/schema.prisma`
- **Client Generation**: Explicit via `npx prisma generate --schema=./prisma/schema.prisma` in Dockerfile
- **Dependencies**: Exact versions `@prisma/client: "6.15.0"` and `prisma: "6.15.0"`
- **Migrations**: Automatic deployment on Railway startup via `dist/boot.js`
- **No Postinstall**: Removed `postinstall` script to prevent schema-not-found errors during `npm ci`

## Railway production notes

- **Root Directory**: `server` (for Railway service configuration)
- **Dockerfile**: Located at repository root (Railway will auto-detect)
- **Health Check Path**: `/api/health`

On boot, the service runs:
1) `prisma migrate deploy --schema=./prisma/schema.prisma`
2) falls back to `prisma db push --accept-data-loss` if needed
3) starts `dist/index.js` via `dist/boot.js`

Ensure `DATABASE_URL` points to the **Private/Internal** Railway Postgres URL in the same project.

## PowerShell smoke tests for your URL

```powershell
# Replace with your service URL (API service), not the web app
$api = "https://hollibobz-production.up.railway.app"

# Health check (should return JSON)
irm "$api/api/health"

# Example endpoint (replace path with a real one from your app)
# irm "$api/api/airports/LHR/schedule?durationMinutes=60"
```
