# syntax=docker/dockerfile:1

########## BUILD STAGE ##########
FROM node:20-alpine AS build
WORKDIR /app

# Minimal OS deps that Prisma often wants
RUN apk add --no-cache libc6-compat openssl

# Make npm deterministic and quiet
RUN npm config set legacy-peer-deps true \
 && npm config set fund false \
 && npm config set audit false

# Copy manifest + lock first for reproducible install
COPY server/package.json ./package.json
COPY server/package-lock.json ./package-lock.json

# Do not run install-time scripts yet (schema isn't copied)
RUN npm ci --ignore-scripts

# Now bring in Prisma schema and source
COPY server/prisma ./prisma
COPY server/tsconfig*.json ./
COPY server/src ./src

# Generate Prisma client after schema is present
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build TS -> dist
RUN npm run build

# Trim dev deps
RUN npm prune --omit=dev


########## RUNTIME STAGE ##########
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy runtime artifacts
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY server/package*.json ./

# Prisma CLI available at runtime for migrations (pin exact)
RUN npm i -g prisma@6.15.0

# Run as non-root
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER node

EXPOSE 3000

# Prefer boot.js if present, fallback to index.js
CMD ["sh", "-lc", "node dist/boot.js || node dist/index.js"]
