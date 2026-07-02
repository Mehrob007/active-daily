# Stage 1: Base
FROM oven/bun:latest as base
WORKDIR /app

# Stage 2: Dependencies
FROM base AS deps
COPY package.json bun.lock ./
RUN BUN_CONFIG_NO_VERIFY=1 bun install

# Stage 3: Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN bun run db:generate

# Initialize a template database structure
ENV DATABASE_URL="file:./db/custom.db"
RUN mkdir -p db && bun run db:push

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN bun run build

# Stage 4: Runner
FROM oven/bun:slim AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Install adduser if missing (slim images are based on debian/ubuntu)
RUN apt-get update && apt-get install -y --no-install-recommends \
    adduser \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nextjs

# Copy the standalone build from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy .env file (if exists)
COPY --from=builder /app/.env* ./

# Handle Database
COPY --from=builder /app/db ./db

# Set permissions
RUN chown -R nextjs:nodejs /app/db
RUN chown -R nextjs:nodejs /app/.env* 2>/dev/null || true

# Set default environment variables
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV DATABASE_URL "file:./db/custom.db"

USER nextjs

EXPOSE 3000

# Start the application
CMD ["bun", "server.js"]
