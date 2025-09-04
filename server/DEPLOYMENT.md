# Railway deploy (API)

## Configuration
- **Root directory**: `server`
- **Install**: `npm ci`
- **Build**: `npm run build`
- **Start**: `npm run start:railway`

## Required Environment Variables
- `DATABASE_URL` (Railway Postgres, prefer Private Networking)

## Optional Environment Variables
- `NODE_ENV=production`
- `APP_ENV=production`
- `ALLOWED_ORIGINS=https://hollibobz-production.up.railway.app,https://expo.dev`

## Deployment Process
1. Railway automatically runs: `npm ci` → `npm run build` → `npm run start:railway`
2. The boot script runs Prisma migrations before starting the server
3. Health check available at `/api/health`

## Testing Deployment
```powershell
$api = "https://hollibobz-production.up.railway.app"
irm "$api/api/health"
```

Expected response:
```json
{
  "ok": true,
  "db": "ok",
  "env": "production"
}
```
