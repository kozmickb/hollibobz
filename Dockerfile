# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Prisma on Alpine
RUN apk add --no-cache libc6-compat openssl

# Make npm deterministic for the peer-dep conflict
RUN npm config set legacy-peer-deps true \
 && npm config set fund false \
 && npm config set audit false

# Install only the backend deps
COPY server/package*.json ./
RUN npm ci

# Copy backend source
COPY server/ ./

# Generate Prisma client with explicit schema path
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build TS -> dist
RUN npm run build

# Remove dev deps but keep the resolved tree
RUN npm prune --omit=dev

# ---- Runtime stage ----
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

ENV NODE_ENV=production \
    PRISMA_HIDE_UPDATE_MESSAGE=true \
    PORT=8080

# Copy artifacts from build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

# Prisma CLI for migrate deploy / fallback at container start
RUN npm i -g prisma@6.15.0

# Non-root
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 && chown -R nodejs:nodejs /app
USER nodejs

# Start with our Railway boot script (already in package.json)
CMD ["npm", "run", "start:railway"]