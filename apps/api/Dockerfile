# ---- Stage 1: Build ----
FROM node:22-alpine AS build

WORKDIR /app

# Copy workspace manifests and lock file
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy API source and Prisma schema
COPY apps/api/src apps/api/src
COPY apps/api/tsconfig.json apps/api/
COPY apps/api/prisma apps/api/prisma

# Generate Prisma Client and compile TypeScript
RUN npm run db:generate -w @matriz/api
RUN npm run build -w @matriz/api

# ---- Stage 2: Runtime ----
FROM node:22-alpine

WORKDIR /app

# Copy workspace manifests
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/

# Install production dependencies only
RUN npm ci --omit=dev --workspace=@matriz/api --ignore-scripts

# Copy Prisma schema, migrations and generated client
COPY apps/api/prisma apps/api/prisma
COPY --from=build /app/node_modules/.prisma node_modules/.prisma
COPY --from=build /app/node_modules/@prisma node_modules/@prisma

# Copy compiled JavaScript
COPY --from=build /app/apps/api/dist apps/api/dist

# Copy .env.example as fallback reference (not used at runtime)
COPY apps/api/.env.example apps/api/.env.example

# Create directory for SQLite data
RUN mkdir -p /data

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV DATABASE_URL=file:/data/matriz.db

EXPOSE 3000

# Apply pending migrations and start the server
CMD npx prisma migrate deploy --schema apps/api/prisma/schema.prisma && node apps/api/dist/server.js
