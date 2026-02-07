# Stage 1: Build
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

# Copy built application and ALL node_modules from root (pnpm hoists deps)
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database/prisma ./prisma

# Copy the generated Prisma client from packages/database where it's generated
COPY --from=builder /app/packages/database/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3001

CMD ["node", "dist/main.js"]
