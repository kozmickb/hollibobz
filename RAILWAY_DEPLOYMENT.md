# Railway Deployment Guide

## Quick Setup

1. **Connect your GitHub repository to Railway**
2. **Set the Root Directory to `server` in Railway dashboard**
3. **Add environment variables:**
   - `DATABASE_URL` (Railway will auto-inject this for Postgres)
   - `NODE_ENV=production`
   - `CORS_ORIGINS=https://your-frontend-domain.com`
   - `METRICS_TOKEN=your-secure-token`
   - `GIT_COMMIT=${{RAILWAY_GIT_COMMIT_SHA}}`

## Railway Service Configuration

- **Root Directory**: `server`
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm run start:railway`
- **Health Check Path**: `/api/health`

## Alternative: Use Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link project
railway login
railway link

# Set environment variables
railway variables set NODE_ENV=production
railway variables set CORS_ORIGINS=https://your-frontend-domain.com
railway variables set METRICS_TOKEN=your-secure-token

# Deploy
railway up
```

## Troubleshooting

If you see "Could not find Prisma Schema" errors:

1. **Verify Root Directory**: Ensure Railway is set to use `server` as the root directory
2. **Check Environment Variables**: Make sure `DATABASE_URL` is properly set
3. **Review Logs**: Check Railway deployment logs for specific error messages

## Health Check

Once deployed, test the health endpoint:

```bash
curl https://your-app.railway.app/api/health
```

Expected response:
```json
{
  "ok": true,
  "uptimeSec": 123,
  "commit": "abc123",
  "db": {
    "ok": true,
    "latencyMs": 15
  },
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```
