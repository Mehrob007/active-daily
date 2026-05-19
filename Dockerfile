# Stage 1: Base
FROM oven/bun:latest as base
WORKDIR /app

# Stage 2: Dependencies
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Stage 3: Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN bun run db:generate

# Initialize a template database structure (optional but helpful for standalone)
ENV DATABASE_URL="file:./db/custom.db"
RUN mkdir -p db && bun run db:push

# Build Next.js
# The build script in package.json handles copying static and public into standalone
ENV NEXT_TELEMETRY_DISABLED 1
RUN bun run build

# Stage 4: Runner
FROM oven/bun:slim AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nextjs

# Copy the standalone build from builder
# Note: package.json build script copies .next/static and public into .next/standalone
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Handle Database
# Copy the initialized database structure
COPY --from=builder /app/db ./db

# Set permissions for the nextjs user to be able to write to the database
RUN chown -R nextjs:nodejs /app/db

# Set default environment variables
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV DATABASE_URL "file:./db/custom.db"

USER nextjs

EXPOSE 3000

# Start the application
CMD ["bun", "server.js"]
