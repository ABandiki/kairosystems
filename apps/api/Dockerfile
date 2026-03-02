# Stage 1: Build with pnpm
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# Copy everything and install
COPY . .
RUN pnpm install

# Generate Prisma client from the database package
WORKDIR /app/packages/database
RUN npx prisma generate

# Build the application
WORKDIR /app/apps/api
RUN pnpm build

# Stage 2: Runner
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV NODE_ENV=production

# Copy root node_modules (includes all hoisted deps in .pnpm)
COPY --from=builder /app/node_modules ./node_modules

# Copy the dist folder from the build
COPY --from=builder /app/apps/api/dist ./dist

# Copy package.json
COPY --from=builder /app/apps/api/package.json ./package.json

# Copy Prisma schema for generation
COPY --from=builder /app/packages/database/prisma ./prisma

# Install prisma CLI for runtime generation
RUN npm install -g prisma@5.22.0

# Install security packages directly (avoiding workspace: protocol conflict)
RUN cd /tmp && npm init -y && npm install helmet@7 @nestjs/throttler@5 && \
    cp -r /tmp/node_modules/helmet /app/node_modules/helmet && \
    cp -r /tmp/node_modules/@nestjs/throttler /app/node_modules/@nestjs/throttler && \
    rm -rf /tmp/node_modules /tmp/package.json /tmp/package-lock.json

# Create startup script that generates Prisma client then runs the app
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'prisma generate --schema=/app/prisma/schema.prisma' >> /app/start.sh && \
    echo 'exec node dist/main.js' >> /app/start.sh && \
    chmod +x /app/start.sh

EXPOSE 3001

CMD ["/app/start.sh"]
