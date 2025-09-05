# Multi-stage Docker build for Node.js/TypeScript/Prisma API
# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Install system dependencies for Prisma
RUN apk add --no-cache libc6-compat openssl

# Configure npm for stable builds
RUN npm config set legacy-peer-deps true && \
    npm config set fund false && \
    npm config set audit false

# Copy package files first for better caching
COPY server/package*.json ./
COPY server/.npmrc . 2>/dev/null || true

# CRITICAL: Copy Prisma schema before npm ci
# This ensures postinstall can find the schema file
COPY server/prisma ./prisma

# Install dependencies (postinstall will now find prisma/schema.prisma)
RUN npm ci

# Copy remaining source code
COPY server/ ./

# Generate Prisma client (redundant but safe)
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build TypeScript to dist/
RUN npm run build

# Remove dev dependencies for lean runtime
RUN npm prune --omit=dev

# Runtime stage
FROM node:20-alpine
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat openssl

# Set production environment
ENV NODE_ENV=production \
    PORT=8080 \
    PRISMA_HIDE_UPDATE_MESSAGE=true

# Copy build artifacts from build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

# Install Prisma CLI globally for migrations
RUN npm i -g prisma@6.15.0

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app
USER nodejs

# Start the application
CMD ["npm", "run", "start:railway"]