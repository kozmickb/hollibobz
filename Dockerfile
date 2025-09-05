# syntax=docker/dockerfile:1

FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

# So npm won't break on peer deps (e.g., openai <-> zod)
RUN npm config set legacy-peer-deps true \
    && npm config set fund false \
    && npm config set audit false

# Install only backend deps first for better caching
COPY server/package.json ./
COPY server/package-lock.json ./
COPY server/.npmrc ./.npmrc
COPY server/scripts ./scripts

# Avoid running prisma generate during install (schema not present yet)
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1
RUN npm ci

# Now bring in schema and source
COPY server/prisma ./prisma
COPY server/tsconfig*.json ./
COPY server/src ./src

# Generate Prisma client once schema exists
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build TS -> dist/
RUN npm run build

# Prune dev deps
RUN npm prune --omit=dev

# ---- Runner ----
FROM node:20-alpine AS runner
WORKDIR /app

# Non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy runtime artifacts
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY server/package*.json ./

# Optional, provides prisma CLI in the container for migrations during boot
RUN npm i -g prisma@6.15.0

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node","dist/boot.js"]