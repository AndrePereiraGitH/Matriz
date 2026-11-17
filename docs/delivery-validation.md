# Matriz — Relatório de Entrega e Validação Final (Ficha 05)

## 1. Alterações Implementadas

Para preparar a aplicação **Matriz** (versão candidata `v0.1.0-rc.2`) para entrega reproduzível, integração contínua e disponibilização em contentores, foram implementadas as seguintes alterações:

- **Containerização Docker Multi-Stage:**
  - `apps/api/Dockerfile`: Build em 2 etapas com `node:22-alpine` (compilação TypeScript e geração do Prisma Client na etapa `build`; execução da API Express e aplicação automática de migrations Prisma `db:deploy` sobre `/data/matriz.db` na etapa `runtime`, porta `3000`).
  - `apps/web/Dockerfile` e `apps/web/nginx.conf`: Build em 2 etapas (`node:22-alpine` para compilar a SPA React/Vite e `nginx:alpine` para servir os ficheiros estáticos na porta `80` com proxy reverso de `/api/v1/` para a API via template `envsubst`).
  - `Dockerfile` e `render.yaml`: Imagem unificada (Web + Nginx + API + SQLite) e especificação Render Blueprint para alojamento sob a mesma origem HTTPS no plano gratuito do Render.
  - `.dockerignore`: Exclusão de `node_modules/`, `dist/`, `.env*`, `*.db*`, `test-results/`, `playwright-report/`, `.git/` e `e2e/` do contexto de build, garantindo imagens limpas e sem credenciais.
- **Orquestração Docker Compose (`compose.yaml` e `.env.example`):**
  - Definição dos serviços `api` (`3000:3000`) e `web` (`5173:80`), ligados através da rede isolada `matriz-net` (`driver: bridge`).
  - Volume persistente nomeado `sqlite-data` montado em `/data` no serviço `api`.
  - *Healthchecks* configurados em ambos os serviços e arranque ordenado (`depends_on` com `condition: service_healthy`).
  - Ficheiro `.env.example` na raiz com valores fictícios de configuração.
- **Ajustes no Código-Fonte para Ambientes Contentorizados e CI:**
  - `apps/api/src/server.ts`: Parametrização do endereço de escuta via `process.env.HOST || '127.0.0.1'` (mantém `127.0.0.1` por omissão em desenvolvimento local e permite `0.0.0.0` em contentores Docker).
  - `apps/api/src/config/env.ts`: Carregamento explícito de `apps/api/.env` relativo ao módulo (`import.meta.url`), garantindo funcionamento consistente quando comandos e testes são executados a partir da raiz do monorepo.
  - `playwright.config.ts` e `e2e/task-lifecycle.spec.ts`: Alinhamento do endereço da API para `http://127.0.0.1:3000/api/v1/auth/me` e refinamento do seletor de estado para suportar carregamento assíncrono em contentores.
- **Integração e Entrega Contínua (GitHub Actions):**
  - `.github/workflows/ci.yml`: Pipeline automática em `push` e `pull_request` no branch `main`, com permissões mínimas (`contents: read`) e 3 jobs sequenciais (`verify` → `e2e` → `docker-build`).
  - `.github/workflows/cd.yml`: Pipeline acionada por tags `v*` ou `workflow_dispatch` que valida o build das imagens Docker e aciona o Deploy Hook do Render quando configurado.
- **Documentação Técnica e Release:**
  - Atualização de `README.md`, `docs/architecture.md` (incluindo diagrama Mermaid da arquitetura e contentores) e `openapi.yaml` (OpenAPI 3.1.0).
  - Criação de `CHANGELOG.md` seguindo *Keep a Changelog* e *Semantic Versioning* (`0.1.0-rc.1` / `0.1.0-rc.2`).

---

## 2. Resultados dos Testes e da Pipeline

| Verificação | Comando / Método | Resultado Observado | Estado |
|---|---|---|---|
| **Análise estática (Linter)** | `npm run lint` | `0 warnings and 0 errors` em `@matriz/api` (18 ficheiros) e `@matriz/web` (3 ficheiros) com Oxlint. | Aprovado |
| **Verificação de tipos** | `npm run typecheck` | `0 errors` em `@matriz/api` e `@matriz/web` (`tsc`). | Aprovado |
| **Build aplicacional** | `npm run build` | Compilação TypeScript e bundle de produção Vite gerados sem erros. | Aprovado |
| **Testes unitários e de integração** | `npm test` | **5 ficheiros, 43 testes aprovados** (Vitest com bases SQLite efémeras isoladas): `task-title.test.ts` (6), `parse-env.test.ts` (6), `database.test.ts` (6), `task-integration.test.ts` (7) e `auth.test.ts` (18). | Aprovado |
| **Testes End-to-End (E2E)** | `npm run test:e2e` | **1 teste aprovado** (1.8s) com Playwright Chromium sobre a stack Docker Compose em execução (login → projeto → criar tarefa → verificar listagem). | Aprovado |
| **Validação e Build Docker Compose** | `docker compose config -q && docker compose build` | Sintaxe válida (`0`) e imagens `matriz-api` e `matriz-web` construídas com sucesso. | Aprovado |
| **Execução e Healthchecks** | `docker compose up -d && docker compose ps` | `matriz-api-1` (`Up (healthy)`, `3000/tcp`) e `matriz-web-1` (`Up (healthy)`, `5173->80/tcp`). | Aprovado |
| **Persistência de dados no volume** | Seed → `docker compose down` → `docker compose up -d` → Login | Utilizadores, projetos e tarefas preservados no volume `matriz_sqlite-data` após destruição e recriação dos contentores. | Aprovado |
| **Auditoria de segredos** | `git ls-files '*.env*' '*.db*' '*.sqlite*'` | Nenhum ficheiro `.env` real, base de dados `.db` ou credencial sensível consta do controlo de versões. | Aprovado |
| **Pipelines GitHub Actions** | `.github/workflows/ci.yml` e `cd.yml` | Publicados em `origin/main` (commit `a84eedf`) e tag `v0.1.0-rc.2`. | Configurado |

---

## 3. Problemas Encontrados e Soluções Aplicadas

Durante o desenvolvimento das Fichas 04 e 05, foram diagnosticados e resolvidos **9 problemas técnicos**:

| # | Problema Identificado | Causa Raiz | Solução Aplicada |
|---|---|---|---|
| **1** | **API inacessível fora do contentor Docker** | `apps/api/src/server.ts` escutava apenas em `'127.0.0.1'`, rejeitando tráfego vindo do contentor Nginx na rede `matriz-net`. | Parametrizado com `const host = process.env.HOST \|\| '127.0.0.1'` e definido `HOST=0.0.0.0` no `Dockerfile` e `compose.yaml`. |
| **2** | **Falha no `postinstall` durante o `docker build` da API** | `npm ci` executa `prisma generate`, mas a pasta `apps/api/prisma` era copiada após `RUN npm ci`. | Movido `COPY apps/api/prisma apps/api/prisma` para antes de `RUN npm ci` em `apps/api/Dockerfile` e usado `npm ci --ignore-scripts` em `apps/web/Dockerfile`. |
| **3** | **Localização de `.prisma` e `prisma` CLI no monorepo** | No npm workspaces, `.prisma` e `prisma` CLI ficavam em `apps/api/node_modules/` em vez de `node_modules/` da raiz. | Atualizado o Stage 2 de `apps/api/Dockerfile` para copiar `/app/node_modules` e `/app/apps/api/node_modules` da etapa de build. |
| **4** | **Conflito na porta `8080` local e upstream fixo no Nginx** | A porta `8080` estava ocupada localmente por outro contentor (Jenkins) e o upstream Nginx não permitia parametrização. | Definida a porta padrão `5173:80` em `compose.yaml` (alinhada com `WEB_ORIGIN=http://localhost:5173`) e usado template `envsubst` (`API_UPSTREAM`). |
| **5** | **Sincronização de arranque entre `web` e `api`** | `depends_on` simples não aguardava a conclusão das migrations e abertura da porta `3000`. | Configurados `healthcheck` em `api` e `web` no `compose.yaml` com `condition: service_healthy`. |
| **6** | **Violação de *strict mode* no seletor Playwright em contentor** | `page.getByRole('status')` encontrava temporariamente 2 indicadores de carregamento (`A carregar responsáveis…` e `A carregar comentários…`) além da mensagem de sucesso. | Ajustado o seletor em `e2e/task-lifecycle.spec.ts` para `page.getByRole('status').filter({ hasText: 'Tarefa criada com sucesso.' })`. |
| **7** | **Falha de `DATABASE_URL` no runner limpo do GitHub Actions** | `apps/api/.env` não está versionado no Git e `dotenv/config` apenas lia `.env` na raiz (`process.cwd()`) quando `npm test` corria da raiz. | Adicionado `cp apps/api/.env.example apps/api/.env` no job `verify` de `ci.yml` e configurado `apps/api/src/config/env.ts` para resolver `apps/api/.env` relativamente ao módulo. |
| **8** | **Expressão inválida `secrets.*` num `if:` de step em `cd.yml`** | O GitHub Actions não permite usar o contexto `secrets` diretamente na cláusula `if:` de um step. | Movida a verificação para `if [ -n "$RENDER_DEPLOY_HOOK_URL" ]` no script shell através da variável injetada em `env:`. |
| **9** | **Falha `"/apps/web/public": not found` no Docker build em CI e no Render** | O diretório `apps/web/public` estava vazio localmente; como o Git não versiona diretórios vazios, a pasta não existia nos clones limpos do GitHub Actions e do Render. | Removida a instrução desnecessária `COPY apps/web/public apps/web/public` de `apps/web/Dockerfile` e `Dockerfile`. |

---

## 4. Utilização dos Agentes de IA

Os agentes de IA (Coding Agents) foram utilizados de forma iterativa e supervisionada ao longo do projeto, respeitando as regras definidas em `AGENTS.md`:

1. **Análise e Planeamento Prévio:** Antes de modificar ficheiros na Ficha 05, o agente analisou a estrutura do monorepo, dependências, variáveis de ambiente e testes existentes, apresentando um plano detalhado para revisão e aprovação humana.
2. **Apoio a Testes e Segurança (Ficha 04):** Geração de testes unitários (`task-title.test.ts`), testes de integração isolados (`task-integration.test.ts`), testes E2E com Playwright (`e2e/task-lifecycle.spec.ts`) e revisão de segurança contra vulnerabilidades IDOR / Broken Access Control (`docs/code-and-security-review.md`).
3. **Containerização, Orquestração e CI/CD (Ficha 05):** Criação dos `Dockerfile`s multi-stage, `.dockerignore`, `compose.yaml` com *healthchecks*, `render.yaml` e workflows `.github/workflows/ci.yml` e `cd.yml`.
4. **Diagnóstico e Revisão Humana:** Todas as propostas e alterações geradas pelo agente foram validadas através da execução real dos comandos (`npm test`, `npm run test:e2e`, `docker compose up`, logs e execuções no GitHub Actions), permitindo detetar e corrigir problemas reais de empacotamento, rede e ambiente CI sob controlo do programador.

---

## 5. Limitações e Funcionalidades Pendentes

1. **Persistência SQLite em Alojamentos Cloud Efémeros (Render Free Tier):**
   - Em execução local com Docker Compose, os dados persistem no volume nomeado `sqlite-data`. No plano gratuito do Render, o sistema de ficheiros do contentor é efémero e reinicializado em cada novo deploy (mitigado no `Dockerfile` do Render através da execução automática de migrations e seed idempotente no arranque; para persistência definitiva em cloud seria necessário *Render Persistent Disk* ou migração para PostgreSQL).
2. **Funcionalidades Fora do Âmbito do MVP (`docs/constraints.md`):**
   - Registo público de contas e recuperação de palavra-passe (as contas são criadas via seed/administração).
   - Paginação na listagem de tarefas (não prevista no contrato `openapi.yaml` atual).
3. **Decisões de Negócio Pendentes de Validação pelo Formador (`docs/constraints.md`):**
   - Confirmação se um utilizador pode pertencer a múltiplas equipas em simultâneo (o modelo de dados `team_memberships` já o suporta, mas a regra funcional aguarda confirmação).
   - Confirmação se um projeto pode ser transferido para outra equipa após a sua criação.
