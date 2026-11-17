# ==============================================================================
# Dockerfile unificado (Web + Nginx Reverse Proxy + API + SQLite) para o Render
# ==============================================================================

# ---- Stage 1: Build API & Web ----
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY apps/api/prisma apps/api/prisma

# Instala dependências e gera o Prisma Client
RUN npm ci

# Copia código fonte da API e do Frontend
COPY apps/api/src apps/api/src
COPY apps/api/tsconfig.json apps/api/
COPY apps/web/src apps/web/src
COPY apps/web/public apps/web/public
COPY apps/web/index.html apps/web/
COPY apps/web/tsconfig.json apps/web/tsconfig.json
COPY apps/web/tsconfig.app.json apps/web/tsconfig.app.json
COPY apps/web/tsconfig.node.json apps/web/tsconfig.node.json
COPY apps/web/vite.config.ts apps/web/

# Compila API e Frontend (com URL relativa /api/v1 servida na mesma origem pelo Nginx)
ENV VITE_API_URL=/api/v1
RUN npm run build

# ---- Stage 2: Runtime (Node.js + Nginx) ----
FROM node:22-alpine

RUN apk add --no-cache nginx && \
    mkdir -p /data /run/nginx && \
    ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/

COPY --from=build /app/node_modules node_modules
COPY --from=build /app/apps/api/node_modules apps/api/node_modules
COPY apps/api/prisma apps/api/prisma
COPY --from=build /app/apps/api/dist apps/api/dist
COPY --from=build /app/apps/web/dist /usr/share/nginx/html

# Script de arranque para o Render:
# 1. Usa RENDER_EXTERNAL_URL como fallback automático para WEB_ORIGIN em produção
# 2. Aplica migrations Prisma e executa seed idempotente se as passwords demo estiverem definidas
# 3. Inicia o Nginx na porta pública $PORT atribuída pelo Render (default 10000)
# 4. Executa a API Express como PID 1 em 127.0.0.1:3000
RUN printf '#!/bin/sh\n\
set -e\n\
\n\
PUBLIC_PORT="${PORT:-10000}"\n\
export WEB_ORIGIN="${WEB_ORIGIN:-${RENDER_EXTERNAL_URL:-http://localhost:${PUBLIC_PORT}}}"\n\
export DATABASE_URL="${DATABASE_URL:-file:/data/matriz.db}"\n\
\n\
cat <<EOF > /etc/nginx/http.d/default.conf\n\
server {\n\
    listen ${PUBLIC_PORT};\n\
    server_name _;\n\
\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    location /api/v1/ {\n\
        proxy_pass http://127.0.0.1:3000/api/v1/;\n\
        proxy_set_header Host \\$host;\n\
        proxy_set_header X-Real-IP \\$remote_addr;\n\
        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;\n\
        proxy_set_header X-Forwarded-Proto \\$scheme;\n\
    }\n\
\n\
    location / {\n\
        try_files \\$uri \\$uri/ /index.html;\n\
    }\n\
}\n\
EOF\n\
\n\
npm run db:deploy -w @matriz/api\n\
\n\
if [ -n "$DEMO_USER_A_PASSWORD" ] && [ -n "$DEMO_USER_B_PASSWORD" ]; then\n\
  node apps/api/dist/database/seed.js\n\
fi\n\
\n\
nginx\n\
exec env PORT=3000 HOST=127.0.0.1 node apps/api/dist/server.js\n' > /app/start-render.sh && chmod +x /app/start-render.sh

ENV NODE_ENV=production
ENV DATABASE_URL=file:/data/matriz.db

EXPOSE 10000

CMD ["/app/start-render.sh"]
