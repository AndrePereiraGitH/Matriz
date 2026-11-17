# ---- Stage 1: Build ----
FROM node:22-alpine AS build

WORKDIR /app

# Copy workspace manifests, lock file and Prisma schema (needed by postinstall)
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY apps/api/prisma apps/api/prisma

# Install dependencies (runs postinstall -> prisma generate)
RUN npm ci

# Copy API source and TypeScript config
COPY apps/api/src apps/api/src
COPY apps/api/tsconfig.json apps/api/

# Compile TypeScript to apps/api/dist
RUN npm run build -w @matriz/api

# ---- Stage 2: Runtime ----
FROM node:22-alpine

WORKDIR /app

# Copy workspace manifests
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/

# Copy node_modules (including generated Prisma Client and Prisma CLI for migrations)
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/apps/api/node_modules apps/api/node_modules

# Copy Prisma schema, migrations and compiled JavaScript
COPY apps/api/prisma apps/api/prisma
COPY --from=build /app/apps/api/dist apps/api/dist

# Create directory for SQLite data
RUN mkdir -p /data

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV DATABASE_URL=file:/data/matriz.db

EXPOSE 3000

# Apply pending migrations and start the server
CMD ["sh", "-c", "npm run db:deploy -w @matriz/api && npm run start -w @matriz/api"]
