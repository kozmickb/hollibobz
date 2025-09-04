# server/Dockerfile
FROM node:20-slim AS build
WORKDIR /app

# Install deps (with dev for build)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ---- Runtime image ----
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production

# Only production deps at runtime
COPY package*.json ./
RUN npm ci --omit=dev

# App artifacts + Prisma schema
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

# Prisma CLI at runtime for migrations
RUN npm i -g prisma@6.15.0

# Start command (expects our boot script to run migrations + start server)
CMD ["npm", "run", "start:railway"]
