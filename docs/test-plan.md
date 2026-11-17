# Plano de testes — tarefas e permissões

Plano do Exercício 1. Os cenários partem de `docs/requirements.md`, `docs/user-stories.md`, `docs/constraints.md` e `openapi.yaml`. O comportamento atual do código não substitui estas fontes. A secção 5 regista a execução dos testes unitários do Exercício 2.

Funcionalidade em teste: tarefas de um projeto e a permissão de as consultar. Cada projeto pertence a uma equipa. Os membros dessa equipa podem criar e consultar as tarefas. O proprietário é a única pessoa que pode editar ou eliminar o projeto; essa restrição não se aplica à gestão de tarefas.

## 1. Matriz proposta

A matriz cobre tarefas e permissões. Os três casos da secção 3 são o conjunto a executar. Os restantes ficam de fora deste exercício.

| ID | Cenário | Entrada | Resultado esperado | Nível |
|---|---|---|---|---|
| T01 | Título composto apenas por espaços | Membro da equipa, `POST /api/v1/projects/{projectId}/tasks` com `{ "title": "   " }` e token CSRF | `422`, `code` `VALIDATION_ERROR`, `details[0].field` igual a `title`. Nenhuma tarefa nova fica persistida. | Integração |
| T02 | Título em falta ou com comprimento inválido após aparar | `{ }` sem `title`; `"ab"`; título com 151 caracteres depois de aparar | `422` com o campo `title`. A tarefa não é criada. | Integração |
| T03 | Título válido com espaços nas extremidades | `{ "title": "  Relatório  " }` | `201`. O título guardado é `Relatório`. | Integração |
| T04 | Criação só com título e consulta seguinte | Membro da equipa, `POST` com `{ "title": "Preparar relatório" }`, sem `status` nem `priority`. Depois `GET /api/v1/tasks/{taskId}` e `GET /api/v1/projects/{projectId}/tasks` com a mesma sessão. | `201` com `projectId` do projeto, título `Preparar relatório`, `status` `TODO`, `priority` `MEDIUM` e `description` `null`. O `GET` da tarefa responde `200` com os mesmos dados. A listagem responde `200` e inclui o `id`. | Integração |
| T05 | A mesma criação vista na interface | Membro autenticado cria a tarefa no detalhe do projeto | Depois da confirmação da API, a tarefa aparece na listagem desse projeto, com o título introduzido e os valores iniciais, sem recarregar a página. | E2E |
| T06 | Membro de outra equipa consulta a tarefa pelo identificador | Tarefa criada por um membro da equipa A. Sessão válida de um membro da equipa B. `GET /api/v1/tasks/{taskId}` com o identificador real. | `404`, `code` `NOT_FOUND`. A resposta não contém título, descrição, estado, prioridade nem `projectId`. A tarefa continua disponível para o membro da equipa A. | Integração |
| T07 | Pedido sem sessão | `GET /api/v1/tasks/{taskId}` sem cookie de sessão | `401`. A tarefa não é devolvida. | Integração |
| T08 | Membro que não é proprietário gere a tarefa | Outro membro da mesma equipa altera o título | `200` e o título atualizado. Membros da equipa gerem tarefas. | Integração |
| T09 | Membro que não é proprietário edita o projeto | `PATCH /api/v1/projects/{projectId}` por um membro que não criou o projeto | `403`, `code` `FORBIDDEN`. O projeto mantém-se. | Integração |
| T10 | Eliminar tarefa com comentário ou atribuição | `DELETE /api/v1/tasks/{taskId}` quando existe um comentário ou uma atribuição | `409`. A tarefa e os dependentes permanecem. | Integração |
| T11 | Estado ou prioridade fora do conjunto | `status` `BLOCKED` ou `priority` `URGENT` | `422` com o campo `status` ou `priority`. | Integração |
| T12 | Mudança direta de `TODO` para `DONE` | `PATCH` com `{ "status": "DONE" }` | Aceite. Não há regra de transição aprovada que a recuse. | Integração |
| T13 | Filtros e contagens | Listagem com `status` e `priority`; contagens do painel | A listagem respeita os filtros. As contagens do projeto incluem todas as tarefas e não diminuem por causa dos filtros. | Integração |
| T14 | Utilizador em mais do que uma equipa, ou projeto transferido de equipa | — | Sem resultado definido. As duas regras continuam por validar. | — |

Pré-condições comuns aos pedidos autenticados: sessão opaca válida e, nos pedidos de escrita, cabeçalho `X-CSRF-Token` obtido em `GET /api/v1/auth/me`. O ambiente é uma base SQLite temporária, com dois utilizadores em equipas diferentes. A base local `apps/api/dev.db` não é usada.

## 2. Revisão da matriz

1. **Quem não pertence à equipa recebe `404`, não `403`.** O requisito é que só os membros consultem a tarefa e que um pedido direto não exponha o recurso. A verificação já aceite do cenário 08 regista `404` com `NOT_FOUND`, a mesma resposta usada quando o identificador não existe. O `403` fica para um utilizador que acede ao recurso mas não pode executar a operação: o caso aprovado é o membro que não é proprietário a editar ou eliminar o projeto. O OpenAPI declara as duas respostas nas rotas de tarefa. Este plano usa `404` no T06 porque é o resultado que cumpre a não exposição do recurso. Se essa escolha for revogada, o T06 tem de ser reescrito antes de se implementar o teste.

2. **Falta de autorização não é falta de sessão.** O T07, sem cookie, espera `401`. O caso essencial é o T06: utilizador autenticado de outra equipa, com o identificador conhecido.

3. **O proprietário não é o único que gere tarefas.** Criar, consultar, editar e eliminar tarefas é permitido aos membros da equipa. A exclusividade do proprietário aplica-se ao projeto. O T08 segue esta regra; o T09 cobre a fronteira do projeto e não entra no conjunto essencial.

4. **A seed com uma equipa por conta de demonstração não decide a pertença a várias equipas.** O ator sem autorização é membro de outra equipa. O T14 mantém-se sem resultado esperado.

5. **Não há transições de estado proibidas.** `TODO`, `IN_PROGRESS` e `DONE` são os valores aceites. O T12 não é um caso de recusa. O painel também não exige uma percentagem de progresso.

6. **O título inválido essencial é o composto só por espaços.** Um texto não vazio pode ser inválido à mesma. O comprimento de 3 a 150 caracteres, já depois de aparar, pertence à mesma regra e fica no T02, fora do mínimo deste exercício. O T01 prova-se na API. A interface pode desativar o botão de criação; isso não demonstra a resposta `422`.

7. **Criação e consulta são o mesmo cenário em dois níveis.** O T04 verifica o contrato e a consulta por identificador. O T05 verifica que a listagem da interface acompanha a confirmação da API. Um não substitui o outro.

8. **O painel sem o projeto da outra equipa não prova o T06.** Esconder a tarefa na lista é outro comportamento. O risco de autorização exige o pedido direto com o identificador conhecido.

9. **CSRF e cookie são pré-condições, não cenários de permissão da tarefa.**

## 3. Casos escolhidos

### C1 — Título inválido

Corresponde a T01. Fonte: requisitos da secção 3 e US09.

- **Nível:** integração.
- **Entrada:** sessão de um membro da equipa do projeto; `POST /api/v1/projects/{projectId}/tasks` com `{ "title": "   " }` e CSRF válido.
- **Resultado esperado:** `422`; `code` igual a `VALIDATION_ERROR`; `details[0].field` igual a `title`. Uma consulta posterior das tarefas do projeto não inclui uma tarefa criada por este pedido.

O Exercício 2 extraiu esta regra para `validateTaskTitle`, sem mudar mensagens, campo, limites nem o estado HTTP. Os testes unitários estão na secção 5. O `422` da API continua a ser o caso de integração C1 e ainda não foi acrescentado.

### C2 — Criação e consulta de uma tarefa

Corresponde a T04 e T05. Fonte: RF03, RF04, RF08 e US09.

- **Nível:** integração e E2E.
- **Entrada da integração:** sessão de um membro; `POST /api/v1/projects/{projectId}/tasks` com `{ "title": "Preparar relatório" }`, sem `status`, `priority` nem `description`. Em seguida, `GET /api/v1/tasks/{taskId}` e `GET /api/v1/projects/{projectId}/tasks` com a mesma sessão e o `taskId` devolvido.
- **Resultado esperado da integração:** `201` com `id`, o `projectId` do projeto, título `Preparar relatório`, `status` `TODO`, `priority` `MEDIUM` e `description` `null`. O `GET` da tarefa responde `200` com os mesmos valores. A listagem responde `200` e contém esse `id`.
- **Entrada do E2E:** o mesmo membro, no detalhe do projeto, cria a tarefa com o título `Preparar relatório`.
- **Resultado esperado do E2E:** após a resposta de sucesso da API, a listagem mostra essa tarefa, sem recarregar a página.

### C3 — Acesso de um utilizador sem autorização

Corresponde a T06. Fonte: acesso reservado aos membros da equipa, US09 e o critério de pedidos diretos com identificadores conhecidos.

- **Nível:** integração.
- **Entrada:** uma tarefa existente num projeto da equipa A; sessão válida de um membro da equipa B; `GET /api/v1/tasks/{taskId}` com o identificador real da tarefa.
- **Resultado esperado:** `404`; `code` igual a `NOT_FOUND`; o corpo não contém os dados da tarefa. O mesmo `GET`, feito pelo membro da equipa A, continua a responder `200`.

## 4. Decisões

- O conjunto a executar é C1, C2 e C3. Filtros, contagens, eliminação com `409`, edição de tarefa por outro membro e a restrição do proprietário sobre o projeto ficam descritos na matriz e fora desta execução.
- C1 fica na API. A rejeição de título só com espaços está definida para a API; o estado do botão na interface não é o resultado esperado deste caso.
- C2 reparte-se entre integração e E2E porque o contrato da resposta e a listagem visível são critérios diferentes.
- C3 usa duas equipas e um identificador conhecido. Não usa ausência de sessão, nem a simples omissão do projeto no painel.
- C3 espera `404` para não revelar a existência da tarefa. A ambiguidade com o `403` também declarado no OpenAPI fica registada na secção 2 e não é tratada como um requisito novo.
- Não se infere pertença a várias equipas, transferência de projeto, regras de transição de estado nem outro indicador de progresso.
- Os testes de integração já existentes em `apps/api/test/auth.test.ts` podem cobrir parte destes resultados. Este plano não os altera nem os dá como suficientes para o E2E, que ainda não tem runner no repositório.

## 5. Execução dos testes unitários (Exercício 2)

No âmbito do Exercício 2, a regra de negócio da validação do título de uma tarefa foi isolada na função pura `validateTaskTitle` em `apps/api/src/domain/task-title.ts` e integrada na validação de tarefas em `apps/api/src/domain/routes.ts`. Os testes unitários foram implementados em `apps/api/test/task-title.test.ts` utilizando Vitest, cobrindo o caso válido, caso inválido e valores-limite de acordo com `docs/requirements.md` (secção 3), `docs/user-stories.md` (US09) e `docs/constraints.md` (secção 2).

### 5.1. Casos de teste e asserções

| ID | Descrição do caso | Entrada | Resultado esperado | Resultado observado |
|---|---|---|---|---|
| U01 | Caso válido com espaços envolventes | `"  Preparar relatório  "` | `{ ok: true, title: "Preparar relatório" }` (apara espaços e aprova) | Passou |
| U02 | Caso inválido (apenas espaços) | `"   "` | `{ ok: false, field: "title", message: "O título da tarefa não pode conter apenas espaços." }` | Passou |
| U03 | Valor-limite inferior válido (3 caracteres) | `"abc"` | `{ ok: true, title: "abc" }` | Passou |
| U04 | Valor-limite inferior inválido (2 caracteres) | `"ab"` | `{ ok: false, field: "title", message: "O título da tarefa deve ter entre 3 e 150 caracteres." }` | Passou |
| U05 | Valor-limite superior válido (150 caracteres) | `"a".repeat(150)` | `{ ok: true, title: "a".repeat(150) }` | Passou |
| U06 | Valor-limite superior inválido (151 caracteres) | `"a".repeat(151)` | `{ ok: false, field: "title", message: "O título da tarefa deve ter entre 3 e 150 caracteres." }` | Passou |

### 5.2. Execução e validação

Comando de execução:
```sh
npm test -- apps/api/test/task-title.test.ts
```

Resultado obtido:
* Ficheiro de testes: `apps/api/test/task-title.test.ts`
* Testes executados: 6 passados (100% de sucesso)
* Duração: ~130ms

As asserções confirmam estritamente os requisitos definidos para o MVP. O código de produção não foi alterado de forma artificial para obter testes verdes.

## 6. Execução dos testes de integração (Exercício 3)

No âmbito do Exercício 3, foram implementados testes de integração em `apps/api/test/task-integration.test.ts` para validar as rotas da API de tarefas e a sua persistência real em base de dados relacional (SQLite), executando sobre um ambiente controlado e isolado:

1. **Ambiente isolado e ciclo de vida:** cada execução cria uma diretoria temporária (`mkdtemp`), executa as migrações Prisma (`prisma migrate deploy`), sementeia dados de teste (`seedDemoData`) com dois utilizadores e equipas distintas (`demo-team-a` e `demo-team-b`), e arranca o servidor Express numa porta efémera (`127.0.0.1:0`). No final (`afterAll`), o servidor é encerrado, a ligação Prisma desligada e a diretoria temporária eliminada.
2. **Fluxo positivo com persistência:** criação de tarefa válida apenas com título, verificação do contrato HTTP `201`, consulta individual via `GET /api/v1/tasks/{taskId}` (`200`), consulta na listagem do projeto via `GET /api/v1/projects/{projectId}/tasks` (`200`), e validação direta na tabela `Task` do SQLite com `database.task.findUnique`.
3. **Cenários negativos e permissões:** validação de título composto apenas por espaços (`422` com `VALIDATION_ERROR` e detalhe no campo `title`, sem persistência de registo), consulta de recurso inexistente (`404` com `NOT_FOUND`), acesso direto por identificador conhecido por membro de outra equipa (`404` com `NOT_FOUND` para não divulgar a existência do recurso) e consulta sem sessão (`401` com `UNAUTHENTICATED`).

### 6.1. Casos de teste e asserções

| ID | Descrição do caso | Entrada | Resultado esperado | Resultado observado |
|---|---|---|---|---|
| I01 | Criação de tarefa válida, consulta e persistência real | Sessão de membro (`demo-team-a`), `POST /api/v1/projects/{id}/tasks` com `{ "title": "Preparar relatório" }`, seguido de `GET /api/v1/tasks/{id}`, `GET /api/v1/projects/{id}/tasks` e query Prisma direta | `201` com `status: "TODO"`, `priority: "MEDIUM"`, `description: null`; `GET` devolve os mesmos dados (`200`); listagem contém o `id` (`200`); registo SQLite contém os campos persistidos | Passou |
| I02 | Título inválido composto apenas por espaços | Sessão de membro, `POST /api/v1/projects/{id}/tasks` com `{ "title": "   " }` e CSRF | `422`, `code: "VALIDATION_ERROR"`, detalhe no campo `title`. Contagem de tarefas na BD não sofre alterações. | Passou |
| I03 | Recurso inexistente | Sessão de membro, `GET /api/v1/tasks/non-existent-task-id` | `404`, `code: "NOT_FOUND"`, mensagem descritiva de recurso não encontrado | Passou |
| I04 | Permissões entre equipas (acesso não autorizado) | Sessão de membro da Equipa B, `GET /api/v1/tasks/{taskIdEquipaA}` | `404`, `code: "NOT_FOUND"`, não revelando a existência da tarefa | Passou |
| I05 | Pedido sem autenticação | `GET /api/v1/tasks/demo-task-a` sem cookie de sessão | `401`, `code: "UNAUTHENTICATED"` | Passou |

### 6.2. Execução e validação

Comando de execução:
```sh
npm test -- apps/api/test/task-integration.test.ts
```

Resultado obtido:
* Ficheiro de testes: `apps/api/test/task-integration.test.ts`
* Testes executados: 5 passados (100% de sucesso)
* Duração: ~850ms

A validação foi confirmada também na suíte completa (`npm test`), passando os 41 testes do repositório, com `typecheck`, `lint` e `build` limpos.

## 7. Execução dos testes End-to-End (Exercício 4)

No âmbito do Exercício 4, foi implementado o teste ponta a ponta (E2E) com Playwright em `e2e/task-lifecycle.spec.ts` para validar o percurso completo do utilizador na interface gráfica, cobrindo o cenário **T05** definido na secção 1 e o caso **C2** na perspetiva de frontend.

### 7.1. Configuração e infraestrutura E2E
* **Runner:** `@playwright/test` configurado em `playwright.config.ts`.
* **Arranque e orquestração:** O bloco `webServer` inicializa automaticamente a API (`http://localhost:3000/api/v1/auth/me`) e a aplicação web (`http://localhost:5173`), assegurando disponibilidade antes do teste.
* **Navegador e diagnóstico:** Execução no Chromium em modo *headless*. A captura de screenshots e traces está configurada estritamente para falhas (`screenshot: 'only-on-failure'`, `trace: 'retain-on-failure'`).
* **Seletores e esperas:** Utilização de seletores semânticos e orientados a acessibilidade (`getByRole`, `getByLabel`, classes de componente `.project-card`, `.task-card`), sem recurso a esperas temporizadas fixas (`waitForTimeout`), tirando partido das asserções reativas do Playwright.

### 7.2. Percurso funcional automatizado

| Passo | Ação do utilizador | Seletor / Interação | Critério de aceitação verificado | Resultado |
|---|---|---|---|---|
| 1 | Autenticação | `input#email`, `input#password`, `button "Iniciar sessão"` com `ana.demo@example.test` | Acesso concedido, cabeçalho "Gestão de projetos" e utilizador visível | Passou |
| 2 | Abrir projeto | `.project-card` ("Projeto de Demonstração A") -> botão "Consultar" | Transição para detalhe do projeto, secção "Tarefas" carregada | Passou |
| 3 | Criar tarefa | Botão "Criar tarefa" -> formulário -> `input#task-title` ("Preparar relatório E2E...") -> botão "Criar tarefa" | Submissão bem-sucedida, mensagem de estado "Tarefa criada com sucesso." e detalhe da tarefa visível | Passou |
| 4 | Verificação na listagem | Botão "← Voltar às tarefas" | O cartão `.task-card` com o novo título surge na listagem sem recarregar a página, com "Estado: Por fazer" e "Prioridade: Média" | Passou |

### 7.3. Execução e validação

Comando de execução:
```sh
npm run test:e2e
```

Resultado obtido:
* **Ficheiro de testes:** `e2e/task-lifecycle.spec.ts`
* **Testes executados:** 1 passado (100% de sucesso)
* **Duração:** ~890ms de execução do teste (~3.3s incluindo arranque dos servidores)

A suíte unitária/integração (`npm test`) mantém-se isolada e a passar com 41 testes com sucesso, e os comandos de verificação (`npm run typecheck`, `npm run lint` e `npm run build`) continuam sem erros.



