# Odysync Server

## Railway Deployment

### Required Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (use Railway's private variable reference to the Postgres service)
- `APP_ENV` - Set to `production` for production deployments
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins (e.g., `https://hollibobz-production.up.railway.app,https://expo.dev`)

### Railway Configuration

- **Root Directory**: `server`
- **Install Command**: `npm ci`
- **Build Command**: `npm run build`
- **Start Command**: `npm run start:railway`

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

### Production Features

- **Automatic Prisma Migrations**: Boot script runs `prisma migrate deploy` before starting
- **Fallback Migration**: If migrations fail, falls back to `prisma db push --accept-data-loss`
- **Database Health Checks**: `/api/health` endpoint verifies database connectivity
- **Security Hardening**: Helmet, Morgan logging, and CORS allowlist
- **Environment-Based Config**: Development vs production settings

### Health Check

The API provides a health check endpoint at `/api/health` that returns JSON with database connectivity status:

```json
{
  "ok": true,
  "db": "ok",
  "env": "production"
}
```

### Prisma Configuration

- **Schema Location**: `prisma/schema.prisma`
- **Client Generation**: Automatic via `postinstall` script
- **Dependencies**: Exact versions `@prisma/client: "6.15.0"` and `prisma: "6.15.0"`
- **Migrations**: Automatic deployment on Railway startup
