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
