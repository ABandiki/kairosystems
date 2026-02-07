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

# Stage 2: Production deps only - use npm for flat node_modules
FROM node:20-alpine AS prod-deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy package.json and install with npm (creates flat node_modules)
COPY apps/api/package.json ./
RUN npm install --omit=dev

# Stage 3: Runner
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV NODE_ENV=production

# Copy built application
COPY --from=builder /app/apps/api/dist ./dist

# Copy production dependencies (flat structure from npm)
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy Prisma schema and generate client
COPY --from=builder /app/packages/database/prisma ./prisma
RUN npx prisma generate

EXPOSE 3001

CMD ["node", "dist/main.js"]
