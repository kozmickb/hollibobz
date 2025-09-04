# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Prisma needs openssl; ensure glibc compat too
RUN apk add --no-cache libc6-compat openssl

# Keep installs deterministic; avoid peer-dep conflicts (zod/openai)
RUN npm config set legacy-peer-deps true \
 && npm config set fund false \
 && npm config set audit false

# Copy package metadata FIRST
COPY server/package*.json ./
# If present, include npmrc so config applies in CI
COPY server/.npmrc . 2>/dev/null || true

# CRITICAL: Copy Prisma schema BEFORE npm ci so postinstall can find it
COPY server/prisma ./prisma

# Install deps (postinstall will run and see prisma/schema.prisma)
RUN npm ci

# Bring in the rest of the backend source
COPY server/ ./

# Redundant but harmless: ensure Prisma client generated with explicit schema
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build TS -> dist
RUN npm run build

# Trim dev deps for runtime
RUN npm prune --omit=dev


# ---- Runtime stage ----
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

ENV NODE_ENV=production \
    PORT=8080 \
    PRISMA_HIDE_UPDATE_MESSAGE=true

# Copy runtime artifacts
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

# Prisma CLI for migrate deploy at container start
RUN npm i -g prisma@6.15.0

# Non-root user
RUN addgroup -g 1001 -S nodejs \
 && adduser -S nodejs -u 1001 \
 && chown -R nodejs:nodejs /app
USER nodejs

# Start command should run your boot script (migrate deploy + start server)
CMD ["npm", "run", "start:railway"]