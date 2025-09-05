# ---------- Build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# Needed by Prisma engines on Alpine
RUN apk add --no-cache libc6-compat openssl

# Quiet npm + reduce peer dep noise in CI
RUN npm config set legacy-peer-deps true \
 && npm config set fund false \
 && npm config set audit false

# Copy ONLY backend manifests first
COPY server/package*.json ./
# Include .npmrc if present
COPY server/.npmrc . 2>/dev/null || true

# Install deps WITHOUT running scripts (skips postinstall)
RUN npm ci --ignore-scripts

# Copy Prisma schema AFTER install
COPY server/prisma ./prisma

# Now copy the rest of the backend source
COPY server/ ./

# Generate Prisma client explicitly with a deterministic schema path
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build TS -> dist
RUN npm run build

# Trim dev deps for runtime
RUN npm prune --omit=dev


# ---------- Runtime stage ----------
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

# This should run your boot script (migrate deploy + start server)
CMD ["npm", "run", "start:railway"]