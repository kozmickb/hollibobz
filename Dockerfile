# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Needed by Prisma engine
RUN apk add --no-cache libc6-compat openssl

# Make npm deterministic and avoid peer-dep churn in CI
RUN npm config set legacy-peer-deps true \
 && npm config set fund false \
 && npm config set audit false

# 1) Copy only backend manifests first
COPY server/package*.json ./
# Optional, if present
COPY server/.npmrc . 2>/dev/null || true

# 2) CRITICAL: copy Prisma BEFORE install so postinstall/generate can see it
COPY server/prisma ./prisma

# 3) Install deps WITHOUT scripts; we'll run generate explicitly later
RUN npm ci --ignore-scripts

# 4) Now copy the rest of the backend source
COPY server/ ./

# 5) Generate Prisma client with explicit schema path
RUN npx prisma generate --schema=./prisma/schema.prisma

# 6) Build TS -> dist
RUN npm run build

# 7) Trim dev deps for runtime
RUN npm prune --omit=dev


# ---- Runtime stage ----
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

ENV NODE_ENV=production \
    PORT=8080 \
    PRISMA_HIDE_UPDATE_MESSAGE=true

# Runtime artifacts
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

# Must point to your boot script (migrate deploy + start server)
CMD ["npm", "run", "start:railway"]