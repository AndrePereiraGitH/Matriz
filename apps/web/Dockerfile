# ---- Stage 1: Build ----
FROM node:22-alpine AS build

WORKDIR /app

# Copy workspace manifests and lock file
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/

# Install dependencies without running API prisma postinstall
RUN npm ci --ignore-scripts

# Copy web source
COPY apps/web/src apps/web/src
COPY apps/web/index.html apps/web/
COPY apps/web/tsconfig.json apps/web/tsconfig.json
COPY apps/web/tsconfig.app.json apps/web/tsconfig.app.json
COPY apps/web/tsconfig.node.json apps/web/tsconfig.node.json
COPY apps/web/vite.config.ts apps/web/

# Build argument for API URL (resolved at build time)
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build -w @matriz/web

# ---- Stage 2: Serve with nginx ----
FROM nginx:alpine

# Copy built static files
COPY --from=build /app/apps/web/dist /usr/share/nginx/html

# Copy custom nginx configuration template
COPY apps/web/nginx.conf /etc/nginx/templates/default.conf.template

ENV NGINX_ENVSUBST_FILTER=API_UPSTREAM
ENV API_UPSTREAM=http://api:3000

EXPOSE 80
