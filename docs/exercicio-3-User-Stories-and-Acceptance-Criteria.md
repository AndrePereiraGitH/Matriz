# Exercício 3 — User Stories e Acceptance Criteria

## 1. Objetivo e pressupostos

O objetivo deste exercício é transformar os requisitos identificados no Exercício 2 em especificações claras, verificáveis e testáveis.

A proposta assume que:
- A aplicação é uma aplicação web para utilização individual.
- A organização das tarefas segue a matriz de Eisenhower.
- A matriz tem quatro quadrantes: Fazer já, Planear, Delegar e Eliminar ou adiar.
- As tarefas têm título, urgência, importância e estado de conclusão.
- Os dados são guardados localmente no navegador.
- A colaboração, as contas de utilizador e a sincronização entre dispositivos ficam fora do MVP.

Estes pressupostos devem ser confirmados antes do desenvolvimento.

## 2. Backlog inicial de User Stories

As prioridades são:
- **P0 — Essencial:** incluída no MVP.
- **P1 — Seguinte:** melhoria a considerar após validar o MVP.
- **P2 — Futura:** funcionalidade fora do âmbito inicial.

### US01 — Consultar a matriz

**Prioridade:** P0

Como utilizador individual, quero visualizar as tarefas organizadas nos quatro quadrantes da matriz de Eisenhower, para identificar rapidamente as minhas prioridades.

**Critérios de aceitação:**

- **Given:** existem tarefas guardadas.
  **When:** abro a aplicação.
  **Then:** cada tarefa é apresentada no quadrante correspondente aos seus valores de urgência e importância.

- **Given:** não existem tarefas guardadas.
  **When:** abro a aplicação.
  **Then:** os quatro quadrantes são apresentados, mesmo que estejam vazios.

### US02 — Criar uma tarefa

**Prioridade:** P0

Como utilizador individual, quero criar uma tarefa com um título, para registar algo que preciso de fazer.

**Critérios de aceitação:**

- **Given:** estou na aplicação.
  **When:** introduzo um título não vazio e confirmo a criação.
  **Then:** a tarefa é criada e apresentada na matriz.

- **Given:** o título está vazio ou contém apenas espaços.
  **When:** tento criar a tarefa.
  **Then:** a aplicação rejeita a criação e apresenta uma mensagem de validação.

- **Given:** criei uma tarefa válida.
  **When:** a tarefa é apresentada.
  **Then:** o seu estado inicial é «não concluída».

### US03 — Classificar uma tarefa

**Prioridade:** P0

Como utilizador individual, quero definir a urgência e a importância de uma tarefa, para a colocar no quadrante adequado.

**Critérios de aceitação:**

- **Given:** estou a criar ou editar uma tarefa.
  **When:** seleciono os valores de urgência e importância.
  **Then:** a aplicação determina o quadrante correspondente.

- **Given:** uma tarefa é urgente e importante.
  **When:** guardo a tarefa.
  **Then:** aparece no quadrante «Fazer já».

- **Given:** uma tarefa é importante e não urgente.
  **When:** guardo a tarefa.
  **Then:** aparece no quadrante «Planear».

- **Given:** uma tarefa é urgente e não importante.
  **When:** guardo a tarefa.
  **Then:** aparece no quadrante «Delegar».

- **Given:** uma tarefa não é urgente nem importante.
  **When:** guardo a tarefa.
  **Then:** aparece no quadrante «Eliminar ou adiar».

### US04 — Editar uma tarefa

**Prioridade:** P0

Como utilizador individual, quero editar uma tarefa existente, para atualizar as suas informações.

**Critérios de aceitação:**

- **Given:** existe uma tarefa.
  **When:** altero o título para um valor válido e guardo.
  **Then:** a matriz apresenta o novo título.

- **Given:** existe uma tarefa classificada num quadrante.
  **When:** altero a urgência ou a importância e guardo.
  **Then:** a tarefa passa para o quadrante correspondente aos novos valores.

- **Given:** introduzo um título vazio.
  **When:** tento guardar a alteração.
  **Then:** a aplicação rejeita a alteração e preserva os dados anteriores.

### US05 — Eliminar uma tarefa

**Prioridade:** P0

Como utilizador individual, quero eliminar uma tarefa, para remover tarefas que já não são necessárias.

**Critérios de aceitação:**

- **Given:** existe uma tarefa.
  **When:** confirmo a sua eliminação.
  **Then:** a tarefa deixa de aparecer na matriz.

- **Given:** a tarefa foi eliminada com sucesso.
  **When:** volto a consultar a matriz.
  **Then:** a tarefa eliminada não é apresentada.

**Decisão pendente:** confirmar se a eliminação deve exigir uma confirmação explícita e se deve existir uma opção para recuperar tarefas eliminadas.

### US06 — Marcar uma tarefa como concluída

**Prioridade:** P0

Como utilizador individual, quero marcar uma tarefa como concluída, para acompanhar o meu progresso.

**Critérios de aceitação:**

- **Given:** existe uma tarefa não concluída.
  **When:** marco a tarefa como concluída.
  **Then:** o seu estado passa a «concluída» e essa condição é visualmente identificável.

- **Given:** existe uma tarefa concluída.
  **When:** marco a tarefa como não concluída.
  **Then:** o seu estado passa novamente a «não concluída».

**Decisão pendente:** definir se as tarefas concluídas permanecem no quadrante original ou passam para uma secção separada.

### US07 — Preservar as tarefas entre sessões

**Prioridade:** P0

Como utilizador individual, quero que as minhas tarefas sejam guardadas localmente, para continuar a utilizá-las depois de fechar e reabrir a aplicação.

**Critérios de aceitação:**

- **Given:** as tarefas foram guardadas com sucesso.
  **When:** fecho e volto a abrir a aplicação no mesmo navegador e ambiente de armazenamento.
  **Then:** as tarefas, a sua classificação e o seu estado de conclusão são recuperados.

- **Given:** ocorre um erro ao guardar os dados.
  **When:** tento criar ou alterar uma tarefa.
  **Then:** a aplicação informa que as alterações podem não ter sido guardadas.

**Limitação:** o armazenamento local não garante a sincronização entre dispositivos ou navegadores diferentes.

### US08 — Gerir projetos

**Prioridade:** P1

Como utilizador individual, quero agrupar tarefas por projeto, para organizar atividades relacionadas.

Esta funcionalidade fica fora do MVP inicial e deverá ser validada antes de ser desenvolvida.

## 3. Situações excecionais e casos-limite

### CE01 — Título vazio

**Situação:** o utilizador tenta criar ou editar uma tarefa sem título.

**Resultado esperado:** a aplicação rejeita a operação, apresenta uma mensagem de validação e não cria uma tarefa inválida.

**User Stories relacionadas:** US02 e US04.

### CE02 — Erro ao guardar os dados

**Situação:** o navegador não permite guardar os dados no armazenamento local.

**Resultado esperado:** a aplicação informa o utilizador do problema e não indica que as alterações foram guardadas com sucesso.

**User Story relacionada:** US07.

### CE03 — Dados guardados inválidos

**Situação:** os dados existentes no armazenamento local não podem ser interpretados corretamente.

**Resultado esperado:** a aplicação apresenta uma mensagem de erro em vez de falhar silenciosamente. A recuperação dos dados deve ser definida antes da implementação.

### CE04 — Alteração da classificação

**Situação:** o utilizador altera a urgência ou a importância de uma tarefa existente.

**Resultado esperado:** a tarefa muda para o quadrante correto, sem ser duplicada nem perder o título ou o estado de conclusão.

**User Stories relacionadas:** US03 e US04.

### CE05 — Eliminação acidental

**Situação:** o utilizador tenta eliminar uma tarefa que ainda pretende manter.

**Resultado esperado:** o comportamento depende da decisão sobre a confirmação da eliminação. Essa decisão deve ser tomada antes de considerar o requisito finalizado.

**User Story relacionada:** US05.

## 4. Revisão de ambiguidades e requisitos não confirmados

Antes de iniciar o desenvolvimento, devem ser validados os seguintes pontos:

1. Confirmar se a matriz de Eisenhower corresponde ao significado pretendido para «Matriz».
2. Definir se a eliminação de tarefas exige confirmação e se existe recuperação.
3. Decidir onde são apresentadas as tarefas concluídas.
4. Confirmar se o armazenamento local é suficiente para o MVP.
5. Definir o limite máximo do título de uma tarefa.
6. Definir o comportamento esperado quando os dados guardados são inválidos.
7. Confirmar se a gestão de projetos pertence ao MVP ou a uma versão posterior.

Estes pontos são decisões pendentes, não requisitos confirmados.

## 5. Conclusão

O backlog inicial transforma os requisitos do MVP em User Stories que descrevem necessidades concretas do utilizador. Os critérios de aceitação definem comportamentos observáveis que podem ser verificados através de testes, e os casos-limite identificam situações que poderiam provocar erros ou perda de dados.

A IA ajuda a estruturar e rever os requisitos, mas não substitui a validação humana. Os pressupostos devem continuar identificados até serem confirmados pelo cliente ou pelos responsáveis pelo projeto.