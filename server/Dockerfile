# ---------- build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# base OS deps used by Prisma engine & OpenSSL
RUN apk add --no-cache libc6-compat openssl

# npm configuration to avoid peer resolution failures
RUN npm config set legacy-peer-deps true \
 && npm config set fund false \
 && npm config set audit false

# copy only manifests first for better caching
COPY package*.json ./
COPY .npmrc ./.npmrc
COPY scripts ./scripts

# IMPORTANT: do not run prisma generate during npm ci (schema not yet in image)
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1

# install with dev deps for TypeScript build
RUN npm ci

# now bring in prisma schema and source (postinstall still skipped)
COPY prisma ./prisma
COPY tsconfig*.json ./
COPY src ./src

# generate Prisma client explicitly (schema now exists)
RUN npx prisma generate --schema=./prisma/schema.prisma

# build TS
RUN npm run build

# remove dev deps for runtime
RUN npm prune --omit=dev

# ---------- runtime stage ----------
FROM node:20-alpine AS runner
WORKDIR /app

# copy artifacts from build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package*.json ./

# prisma CLI (optional but nice for debugging)
RUN npm i -g prisma@6.15.0

# default start is the Railway boot sequence
CMD ["node", "dist/boot.js"]