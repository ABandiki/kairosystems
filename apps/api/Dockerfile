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

# Deploy to a standalone directory with all dependencies
WORKDIR /app
RUN pnpm --filter @kairo/api deploy --prod /deploy

# Stage 2: Runner
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV NODE_ENV=production

# Copy the deployed app (includes node_modules with resolved deps)
COPY --from=builder /deploy ./

# Copy the dist folder from the build
COPY --from=builder /app/apps/api/dist ./dist

# Copy Prisma schema and generate client
COPY --from=builder /app/packages/database/prisma ./prisma
RUN npx prisma generate

EXPOSE 3001

CMD ["node", "dist/main.js"]
