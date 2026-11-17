# Matriz — Relatório de Validação Final e Troubleshooting (Ficha 05)

## 1. Objetivo

Registar a verificação global da preparação do projeto **Matriz** (versão candidata `0.1.0-rc.1`) para entrega, abrangendo a execução via Docker e Docker Compose, os testes automatizados (unitários, integração e E2E), a configuração de CI/CD em GitHub Actions, a auditoria de segredos e os problemas diagnosticados e corrigidos durante o processo.

---

## 2. Verificações Executadas e Requisitos Cumpridos

| Verificação | Comando / Método | Resultado Observado | Estado |
|---|---|---|---|
| **Validação Docker Compose** | `docker compose config -q` | Sintaxe e variáveis válidas (código de saída `0`). | Cumprido |
| **Build das imagens Docker** | `docker compose build` | Imagens `matriz-api` e `matriz-web` construídas com builds multi-stage. | Cumprido |
| **Arranque e Healthchecks** | `docker compose up -d && docker compose ps` | `matriz-api-1` (`Up (healthy)`, `3000/tcp`) e `matriz-web-1` (`Up (healthy)`, `5173->80/tcp`). | Cumprido |
| **Persistência SQLite** | Seed → `docker compose down` → `docker compose up -d` → Login | Dados preservados no volume nomeado `matriz_sqlite-data` (`/data/matriz.db`). | Cumprido |
| **Análise estática (Linter)** | `npm run lint` | `0 warnings and 0 errors` em `@matriz/api` e `@matriz/web` (Oxlint). | Cumprido |
| **Verificação de tipos** | `npm run typecheck` | `0 errors` em `@matriz/api` e `@matriz/web` (TypeScript). | Cumprido |
| **Build aplicacional** | `npm run build` | Compilação concluída sem erros em ambos os workspaces. | Cumprido |
| **Testes unitários e integração** | `npm test` | 5 ficheiros, **43 testes aprovados** (Vitest com bases SQLite isoladas). | Cumprido |
| **Testes End-to-End (E2E)** | `npm run test:e2e` (sobre a stack Docker Compose ativa) | **1 teste aprovado** em 1.8s (login → projeto → criação de tarefa → listagem). | Cumprido |
| **Inspeção de logs** | `docker compose logs --tail=50` | Sem erros ou exceções; migrações aplicadas e pedidos HTTP `200`/`201`/`304`. | Cumprido |
| **Auditoria de credenciais** | `git ls-files '*.env*' '*.db*' '*.sqlite*'` | Apenas ficheiros `.env.example` com placeholders fictícios estão versionados; `.env` e `*.db` ignorados pelo `.gitignore` e `.dockerignore`. | Cumprido |

---

## 3. Problemas Identificados e Correções Aplicadas (Troubleshooting)

Durante a preparação e validação da entrega (Ficha 05), foram diagnosticados e corrigidos **7 problemas técnicos**:

| # | Problema Identificado | Causa Raiz | Correção Aplicada |
|---|---|---|---|
| **1** | **API inacessível fora do contentor Docker** | `apps/api/src/server.ts` escutava exclusivamente em `'127.0.0.1'`, rejeitando ligações provenientes do proxy Nginx na rede bridge do Docker. | Parametrizado o endereço de escuta com `const host = process.env.HOST \|\| '127.0.0.1'` (`0.0.0.0` no contentor, mantendo `127.0.0.1` no desenvolvimento local). |
| **2** | **Falha no `postinstall` durante o `docker build` da API** | O script `postinstall` da raiz executa `prisma generate`, mas `apps/api/prisma` era copiado apenas depois de `RUN npm ci`. | Movida a instrução `COPY apps/api/prisma apps/api/prisma` para antes de `RUN npm ci` em `apps/api/Dockerfile` e adicionado `--ignore-scripts` em `apps/web/Dockerfile`. |
| **3** | **Localização do Prisma Client no workspace durante o Stage 2 do Dockerfile** | No monorepo npm, `.prisma` e `prisma` CLI são instalados em `apps/api/node_modules/` e não apenas no `node_modules/` de topo. | Atualizado o Stage 2 de `apps/api/Dockerfile` para copiar `/app/node_modules` e `/app/apps/api/node_modules` do stage de build. |
| **4** | **Conflito de porta `8080` no máquina anfitriã e rigidez do upstream Nginx** | A porta `8080` estava ocupada localmente por outro serviço (Jenkins) e o `nginx.conf` tinha `http://api:3000` fixo. | Alterada a porta padrão do serviço `web` em `compose.yaml` para `5173:80` (alinhada com `WEB_ORIGIN=http://localhost:5173`) e configurado template `envsubst` com `API_UPSTREAM`. |
| **5** | **Ordem de arranque entre `web` e `api` no Docker Compose** | `depends_on` simples apenas aguarda o arranque do contentor, não a conclusão das migrations e abertura da porta HTTP. | Adicionados `healthcheck` em `api` e `web` no `compose.yaml` e configurada a condição `service_healthy` em `depends_on`. |
| **6** | **Violação de *strict mode* no seletor Playwright durante carregamento assíncrono no contentor** | Ao testar o fluxo E2E contra os contentores Docker, `getByRole('status')` coincidia temporariamente com 2 indicadores de carregamento (`A carregar responsáveis…` e `A carregar comentários…`) além do banner de sucesso. | Refinado o seletor em `e2e/task-lifecycle.spec.ts` para `page.getByRole('status').filter({ hasText: 'Tarefa criada com sucesso.' })`. |
| **7** | **Falha no job `verify` do GitHub Actions (`DATABASE_URL must be a SQLite file URL`)** | No runner limpo do GitHub Actions, `apps/api/.env` não existe por omissão (não é versionado) e `dotenv/config` apenas procurava `.env` no diretório raiz quando `npm test` corria da raiz. | Adicionado o passo `cp apps/api/.env.example apps/api/.env` antes de `npm ci` em `.github/workflows/ci.yml` e configurado `apps/api/src/config/env.ts` para carregar `apps/api/.env` relativamente ao módulo. |

---

## 4. Limitações Conhecidas e Questões em Aberto

1. **Motor de base de dados SQLite em ambientes Cloud (ex.: Render):**
   - O SQLite baseia-se num ficheiro único (`/data/matriz.db`). Em Docker Compose local com o volume `sqlite-data` os dados persistem entre recriações de contentores, mas em plataformas cloud com filesystem efémero é necessário associar um disco persistente (*Render Disk*) ou migrar futuramente para PostgreSQL se houver múltiplos réplicas.
2. **Execução do workflow GitHub Actions no repositório remoto:**
   - Os workflows `.github/workflows/ci.yml` e `.github/workflows/cd.yml` estão criados e todos os seus passos foram validados localmente; a evidência de execução nos runners remotos do GitHub ocorre após `git push` para `origin/main`.
3. **Decisões de negócio pendentes do formador (`docs/constraints.md`):**
   - Pertença simultânea de um utilizador a múltiplas equipas.
   - Transferência de projetos entre equipas após a criação.
