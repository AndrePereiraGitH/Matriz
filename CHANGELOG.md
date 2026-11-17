# Changelog

Todas as alterações relevantes deste projeto são documentadas neste ficheiro.

O formato baseia-se em [Keep a Changelog](https://keepachangelog.com/pt-PT/1.1.0/) e este projeto segue [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [0.1.0-rc.1] — 2026-11-17

### Notas de Lançamento (Release Candidate 1)

A versão **`0.1.0-rc.1`** constitui a primeira versão candidata de entrega do MVP da aplicação **Matriz** (gestão de projetos e tarefas para equipas de trabalho). Inclui o ciclo completo de autenticação e autorização por equipa/proprietário, gestão de projetos, tarefas, responsáveis e comentários, painel de progresso por estado, suite de testes automatizados (unitários, integração e End-to-End), containerização com Docker e Docker Compose e pipelines de CI/CD em GitHub Actions.

### Adicionado

- **Autenticação e Sessão (`@matriz/api`, `@matriz/web`):**
  - Endpoints `POST /api/v1/auth/login`, `GET /api/v1/auth/me` e `POST /api/v1/auth/logout`.
  - Sessões opacas persistidas no SQLite (apenas hash SHA-256 do token de sessão e do token CSRF), cookie `matriz_session` (`HttpOnly`, `SameSite=Lax`, validade absoluta de 8 horas) e proteção CSRF sincronizadora via cabeçalho `X-CSRF-Token`.
  - Hashing de palavras-passe com `scrypt` e seed explícita de contas de demonstração (`ana.demo@example.test` e `bruno.demo@example.test`).
- **Gestão de Equipas, Projetos e Painel:**
  - Listagem de equipas do utilizador (`GET /api/v1/teams`) e resumo do painel com contagens de tarefas por estado (`GET /api/v1/dashboard`).
  - CRUD de projetos (`GET/POST /api/v1/projects`, `GET/PATCH/DELETE /api/v1/projects/{projectId}`) com pesquisa por nome (`?search=`), atribuição automática de proprietário (`ownerId`) e bloqueio de eliminação quando existem tarefas associadas (`409 Conflict`).
- **Gestão de Tarefas, Responsáveis e Comentários:**
  - CRUD de tarefas por projeto (`GET/POST /api/v1/projects/{projectId}/tasks`, `GET/PATCH/DELETE /api/v1/tasks/{taskId}`) com estados (`TODO`, `IN_PROGRESS`, `DONE`), prioridades (`LOW`, `MEDIUM`, `HIGH`) e filtros combináveis.
  - Validação pura do título de tarefa isolada em `validateTaskTitle` (`apps/api/src/domain/task-title.ts`).
  - Gestão idempotente de responsáveis elegíveis (`GET /api/v1/tasks/{taskId}/eligible-assignees`, `GET /api/v1/tasks/{taskId}/assignees`, `PUT/DELETE /api/v1/tasks/{taskId}/assignees/{userId}`).
  - Listagem e criação de comentários em tarefas (`GET/POST /api/v1/tasks/{taskId}/comments`) com autor e data atribuídos pelo servidor.
- **Qualidade, Testes e Segurança:**
  - 43 testes unitários e de integração com Vitest (`task-title.test.ts`, `parse-env.test.ts`, `database.test.ts`, `auth.test.ts`, `task-integration.test.ts`) sobre bases SQLite isoladas, incluindo regressão contra IDOR / Broken Access Control.
  - Teste End-to-End com Playwright (`e2e/task-lifecycle.spec.ts`) cobrindo login, abertura de projeto, criação de tarefa e verificação na listagem.
  - Análise estática com Oxlint em ambos os workspaces (`@matriz/api` e `@matriz/web`).
  - Relatórios técnicos em `docs/test-plan.md` e `docs/code-and-security-review.md`.
- **Containerização e CI/CD:**
  - `apps/api/Dockerfile` e `apps/web/Dockerfile` (builds multi-stage com `node:22-alpine` e `nginx:alpine`) e `.dockerignore`.
  - Orquestração com Docker Compose (`compose.yaml`), rede `matriz-net`, volume persistente `sqlite-data`, healthchecks e `.env.example` na raiz.
  - Workflows GitHub Actions para Integração Contínua (`.github/workflows/ci.yml`) e Entrega Contínua (`.github/workflows/cd.yml`).
  - Parametrização do endereço de escuta da API via variável `HOST` (default `127.0.0.1` localmente, `0.0.0.0` em contentor).
