# Odysync Server

## Railway Deployment

### Required Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (use Railway's private variable reference to the Postgres service)
- `APP_ENV` - Set to `production` for production deployments
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins (e.g., `https://hollibobz-production.up.railway.app,https://expo.dev`)

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

### Health Check

The API provides a health check endpoint at `/api/health` that returns JSON with database connectivity status:

```json
{
  "ok": true,
  "time": "2024-01-01T00:00:00.000Z",
  "env": "production",
  "db": "ok"
}
```
