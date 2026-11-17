# Relatório de Code Review e Security Review — Matriz (Exercício 5)

## 1. Enquadramento e Objetivo

Este documento regista a execução do **Exercício 5 (Code Review e Security Review)**, com foco na identificação de bugs, validações em falta, controlo de acessos (Broken Access Control / IDOR), tratamento de erros e segurança geral no sistema Matriz.

* **Atores de teste:**
  * **Ana Demonstração (`ana.demo@example.test`):** Membro de `demo-team-a`, proprietária de `demo-project-a` e responsável por `demo-task-a`.
  * **Bruno Demonstração (`bruno.demo@example.test`):** Membro de `demo-team-b`, proprietário de `demo-project-b` e responsável por `demo-task-b`.
* **Âmbito:** Alterações recentes (`diff` do incremento de testes unitários, testes de integração e Playwright E2E), módulos de domínio (`apps/api/src/domain/`), autenticação (`apps/api/src/auth/`), middleware HTTP (`apps/api/src/http/`) e cliente web (`apps/web/`).

---

## 2. Code Review das Alterações Recentes

### 2.1. Avaliação do Diff Recente
1. **Isolamento de Regras de Negócio (`apps/api/src/domain/task-title.ts`):**
   * A validação do título de tarefas foi isolada na função pura `validateTaskTitle(title: unknown): TaskTitleValidation`.
   * A função valida: tipo string, rejeição de títulos vazios ou constituídos apenas por espaços após `trim()`, e contagem de caracteres por pontos de código com `Array.from(trimmed).length` (respeitando o intervalo aprovado de 3 a 150 caracteres).
2. **Integração no Router de Domínio (`apps/api/src/domain/routes.ts`):**
   * `validateTaskText` integra `validateTaskTitle` preservando a resposta `422 Unprocessable Entity` com `details[0].field = "title"` e mensagem amigável em português.
3. **Mass Assignment Prevention:**
   * Os parsers `parseProjectInput`, `parseTaskInput`, `parseProjectUpdate` e `parseTaskUpdate` utilizam `Object.keys(value).some(...)` com listas explícitas de chaves permitidas, rejeitando qualquer atributo inesperado com `422 VALIDATION_ERROR`.
4. **Tratamento de Exceções:**
   * A camada de persistência utiliza chaves estrangeiras restritivas (`onDelete: Restrict`). Eliminações com dependências são capturadas através de `isForeignKeyConflict` (códigos Prisma `P2003` e `P2014`), respondendo com `409 CONFLICT` sem fugas de informação estrutural.

---

## 3. Análise de Segurança: Acesso e IDOR (Broken Access Control)

Foi avaliada a fronteira de autorização entre as contas `demo-user-a` e `demo-user-b`. Em conformidade com os requisitos e especificações da API, a Matriz adota a regra de devolver `404 NOT_FOUND` sempre que um utilizador tenta aceder diretamente por identificador conhecido a um recurso de outra equipa, impedindo a enumeração e confirmação de existência de projetos ou tarefas.

### 3.1. Matriz de Resultados Observados

| Vetor de Teste | Operação HTTP | Utilizador | Recurso Alvo | Resultado Esperado | Resultado Observado | Veredicto |
|---|---|---|---|---|---|---|
| **IDOR Leitura de Projeto** | `GET /api/v1/projects/{id}` | Bruno (Equipa B) | `demo-project-a` (Equipa A) | `404 NOT_FOUND` | `404 NOT_FOUND` | **Seguro** |
| **Listagem Scoped** | `GET /api/v1/projects` | Bruno (Equipa B) | Lista geral | Apenas projetos da Equipa B | Apenas `demo-project-b` devolvido | **Seguro** |
| **Dashboard Scoped** | `GET /api/v1/dashboard` | Bruno (Equipa B) | Dashboard | Apenas contagens da Equipa B | Apenas `demo-project-b` devolvido | **Seguro** |
| **IDOR Edição de Projeto** | `PATCH /api/v1/projects/{id}` | Bruno (Equipa B) | `demo-project-a` (Equipa A) | `404 NOT_FOUND` | `404 NOT_FOUND` | **Seguro** |
| **Permissão Não-Proprietário** | `PATCH /api/v1/projects/{id}` | Membro da equipa | Projeto de outro proprietário | `403 FORBIDDEN` | `403 FORBIDDEN` | **Seguro** |
| **IDOR Eliminação de Projeto** | `DELETE /api/v1/projects/{id}` | Bruno (Equipa B) | `demo-project-a` (Equipa A) | `404 NOT_FOUND` | `404 NOT_FOUND` | **Seguro** |
| **IDOR Criação de Tarefa** | `POST /api/v1/projects/{id}/tasks` | Bruno (Equipa B) | `demo-project-a` (Equipa A) | `404 NOT_FOUND` | `404 NOT_FOUND` | **Seguro** |
| **IDOR Leitura de Tarefa** | `GET /api/v1/tasks/{id}` | Bruno (Equipa B) | `demo-task-a` (Equipa A) | `404 NOT_FOUND` | `404 NOT_FOUND` | **Seguro** |
| **IDOR Edição de Tarefa** | `PATCH /api/v1/tasks/{id}` | Bruno (Equipa B) | `demo-task-a` (Equipa A) | `404 NOT_FOUND` | `404 NOT_FOUND` | **Seguro** |
| **IDOR Eliminação de Tarefa** | `DELETE /api/v1/tasks/{id}` | Bruno (Equipa B) | `demo-task-a` (Equipa A) | `404 NOT_FOUND` | `404 NOT_FOUND` | **Seguro** |
| **IDOR Leitura de Comentários** | `GET /api/v1/tasks/{id}/comments` | Bruno (Equipa B) | `demo-task-a` (Equipa A) | `404 NOT_FOUND` | `404 NOT_FOUND` | **Seguro** |
| **IDOR Criação de Comentário** | `POST /api/v1/tasks/{id}/comments` | Bruno (Equipa B) | `demo-task-a` (Equipa A) | `404 NOT_FOUND` | `404 NOT_FOUND` | **Seguro** |
| **IDOR Atribuição em Tarefa** | `PUT /api/v1/tasks/{id}/assignees/{u}` | Bruno (Equipa B) | `demo-task-a` (Equipa A) | `404 NOT_FOUND` | `404 NOT_FOUND` | **Seguro** |
| **Atribuição Inelegível** | `PUT /api/v1/tasks/{id}/assignees/{u}` | Ana (Equipa A) | `demo-task-a` com `demo-user-b` | `422 VALIDATION_ERROR` | `422 VALIDATION_ERROR` | **Seguro** |

---

## 4. Análise Estática de Código

1. **Oxlint (`npm run lint`):**
   * Configurado e validado para ambos os workspaces:
     * `@matriz/api`: 18 ficheiros analisados, 0 avisos, 0 erros.
     * `@matriz/web`: 3 ficheiros analisados, 0 avisos, 0 erros.
2. **TypeScript Compiler (`npm run typecheck`):**
   * Executado em modo estrito (`tsc --noEmit` na API e `tsc -b` na Web) — 0 erros.
3. **Ferramentas estáticas ausentes:**
   * ESLint, Semgrep e SonarQube não se encontram presentes no ambiente local.

---

## 5. Findings Identificados e Recomendações

### [SEC-01] Oráculo de Enumeração de Utilizadores em Atribuições (User Enumeration Oracle)
* **Ficheiro:** `apps/api/src/domain/routes.ts` (linhas 857-880)
* **Evidência:** Se `userId` não existir globalmente, a rota responde `404 NOT_FOUND`. Se o utilizador existir mas pertencer a outra equipa, responde `422 VALIDATION_ERROR`.
* **Impacto:** Permite a um utilizador autenticado distinguir identificadores existentes de não existentes na base de dados global.
* **Severidade:** **Low / Informational** (comportamento documentado no contrato OpenAPI).
* **Decisão / Estado:** Mantido em conformidade estrita com o contrato `openapi.yaml` (linhas 506 e 512) e com os testes de regressão existentes em `auth.test.ts`.

### [SEC-02] Ausência de Rate Limiting na Autenticação
* **Ficheiro:** `apps/api/src/auth/routes.ts` (linhas 90-153)
* **Evidência:** O endpoint `POST /api/v1/auth/login` valida credenciais via `scrypt` com `timingSafeEqual`, mas não impõe limitação ao número de tentativas falhadas.
* **Impacto:** Risco teórico de tentativas de força bruta contra contas conhecidas.
* **Severidade:** **Low** para o MVP local; **Medium** em ambiente de produção.
* **Recomendação:** Introduzir middleware de limitação de taxa (e.g. `express-rate-limit`) quando for planeada a transição para ambiente de produção.

### [BUG-01] Ausência de Script de Linting no Backend (`apps/api`)
* **Ficheiro:** `apps/api/package.json`
* **Evidência:** O script `lint` da raiz executava o linter apenas em `apps/web`.
* **Impacto:** Ficheiros do backend não eram auditados automaticamente na execução de `npm run lint`.
* **Severidade:** **Low**.
* **Correção aplicada:** Adicionado script `"lint": "oxlint"` em `apps/api/package.json`. O comando na raiz passa a verificar ambos os pacotes com sucesso.

---

## 6. Testes de Regressão e Validação

Com base nas conclusões da análise, foram adicionados testes de integração adicionais em `apps/api/test/task-integration.test.ts` para cobrir explicitamente todos os vetores de IDOR e Broken Access Control:
1. `impõe permissões e impede membro de outra equipa de criar, alterar ou eliminar tarefas (IDOR)` (validação com 404 em `POST`, `PATCH`, `DELETE` e comentários entre equipas).
2. `valida regras de elegibilidade na atribuição de responsáveis` (validação de `422` para utilizador de outra equipa e `404` para utilizador inexistente).

### Resultados de Execução:
* **Testes de Integração (`npm test -- apps/api/test/task-integration.test.ts`):** 7 testes passados (100% sucesso) em ~930ms.
* **Suíte Completa (`npm test`):** 5 ficheiros e 43 testes passados (100% sucesso) em ~2.0s.
* **Testes E2E (`npm run test:e2e`):** 1 teste passado (100% sucesso) em ~3.3s.
* **Linter (`npm run lint`):** 0 avisos e 0 erros em 21 ficheiros (API e Web).
* **Tipos (`npm run typecheck`):** 0 erros na API e Web.
