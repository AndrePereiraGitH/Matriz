# Matriz — User Stories

## 1. Convenções de prioridade

- **P0:** funcionalidade essencial para o MVP.
- **P1:** funcionalidade prevista para uma iteração posterior.
- **P2:** funcionalidade futura, fora do âmbito inicial.

## 2. User Stories do MVP

### US01 — Visualizar a matriz

**Prioridade:** P0

Como utilizador individual, quero visualizar as tarefas organizadas nos quatro quadrantes, para identificar rapidamente as minhas prioridades.

**Critérios de aceitação:**

- **Given** que existem tarefas guardadas, **when** abro a aplicação, **then** cada tarefa é apresentada no quadrante correspondente à sua classificação.
- **Given** que não existem tarefas, **when** abro a aplicação, **then** os quatro quadrantes são apresentados, mesmo que estejam vazios.

### US02 — Criar uma tarefa

**Prioridade:** P0

Como utilizador individual, quero criar uma tarefa com um título, para registar algo que preciso de fazer.

**Critérios de aceitação:**

- **Given** que estou na aplicação, **when** introduzo um título válido e confirmo a criação, **then** a tarefa é criada e apresentada na matriz.
- **Given** que o título está vazio ou contém apenas espaços, **when** tento criar a tarefa, **then** a aplicação rejeita a criação e apresenta uma mensagem de validação.
- **Given** que uma tarefa foi criada, **when** é apresentada pela primeira vez, **then** o seu estado é «não concluída».

### US03 — Classificar uma tarefa

**Prioridade:** P0

Como utilizador individual, quero definir a urgência e a importância de uma tarefa, para a colocar no quadrante adequado.

**Critérios de aceitação:**

- **Given** que estou a criar ou editar uma tarefa, **when** defino a urgência e a importância, **then** a aplicação determina o quadrante correspondente.
- **Given** que uma tarefa é urgente e importante, **when** guardo a tarefa, **then** aparece em «Fazer já».
- **Given** que uma tarefa é importante, mas não urgente, **when** guardo a tarefa, **then** aparece em «Planear».
- **Given** que uma tarefa é urgente, mas não importante, **when** guardo a tarefa, **then** aparece em «Delegar».
- **Given** que uma tarefa não é urgente nem importante, **when** guardo a tarefa, **then** aparece em «Eliminar ou adiar».

### US04 — Editar uma tarefa

**Prioridade:** P0

Como utilizador individual, quero editar uma tarefa existente, para atualizar as suas informações.

**Critérios de aceitação:**

- **Given** que existe uma tarefa, **when** altero o título para um valor válido e guardo, **then** o novo título é apresentado.
- **Given** que altero a urgência ou a importância, **when** guardo as alterações, **then** a tarefa passa para o quadrante correspondente.
- **Given** que introduzo um título vazio, **when** tento guardar, **then** a alteração é rejeitada e os dados anteriores são preservados.

### US05 — Eliminar uma tarefa

**Prioridade:** P0

Como utilizador individual, quero eliminar uma tarefa, para remover tarefas que já não são necessárias.

**Critérios de aceitação:**

- **Given** que existe uma tarefa, **when** executo a ação de eliminação definida pela aplicação, **then** a tarefa deixa de aparecer na matriz.
- **Given** que a eliminação foi concluída, **when** volto a consultar a matriz, **then** a tarefa eliminada não é apresentada.

**Questão pendente:** definir se é necessária uma confirmação antes da eliminação e se existe recuperação de tarefas eliminadas.

### US06 — Marcar uma tarefa como concluída

**Prioridade:** P0

Como utilizador individual, quero marcar uma tarefa como concluída ou não concluída, para acompanhar o meu progresso.

**Critérios de aceitação:**

- **Given** que existe uma tarefa não concluída, **when** a marco como concluída, **then** o seu estado é atualizado e fica visualmente identificável.
- **Given** que existe uma tarefa concluída, **when** a marco novamente como não concluída, **then** o estado é revertido.

**Questão pendente:** decidir se as tarefas concluídas permanecem nos quadrantes originais ou passam para uma secção separada.

### US07 — Guardar e recuperar tarefas

**Prioridade:** P0

Como utilizador individual, quero que as minhas tarefas sejam guardadas localmente, para continuar a utilizá-las depois de reabrir a aplicação.

**Critérios de aceitação:**

- **Given** que as alterações foram guardadas com sucesso, **when** fecho e reabro a aplicação no mesmo navegador e ambiente de armazenamento, **then** as tarefas, classificações e estados são recuperados.
- **Given** que ocorre um erro de armazenamento, **when** tento guardar alterações, **then** a aplicação informa que as alterações podem não ter sido guardadas.

## 3. User Stories futuras

### US08 — Organizar tarefas por projeto

**Prioridade:** P1

Como utilizador individual, quero agrupar tarefas por projeto, para organizar atividades relacionadas.

### US09 — Definir datas limite

**Prioridade:** P1

Como utilizador individual, quero definir datas limite para as tarefas, para acompanhar os prazos.

### US10 — Pesquisar e filtrar tarefas

**Prioridade:** P1

Como utilizador individual, quero pesquisar e filtrar tarefas, para encontrar rapidamente a informação de que preciso.

### US11 — Partilhar projetos

**Prioridade:** P2

Como utilizador colaborador, quero partilhar projetos com outras pessoas, para trabalhar em tarefas comuns.

Esta história depende de autenticação, permissões e armazenamento partilhado, pelo que não faz parte do MVP.

## 4. Casos excecionais

### CE01 — Título vazio
A aplicação não permite criar ou guardar uma tarefa com um título vazio ou composto apenas por espaços.

### CE02 — Falha no armazenamento
A aplicação informa o utilizador de que os dados podem não ter sido guardados e não apresenta uma operação falhada como concluída com sucesso.

### CE03 — Dados locais inválidos
A aplicação informa o utilizador quando não consegue interpretar os dados guardados e evita apagá-los automaticamente sem uma decisão explícita.

### CE04 — Alteração da classificação
A tarefa muda para o quadrante correto sem ser duplicada nem perder o título ou o estado de conclusão.

### CE05 — Eliminação de uma tarefa
A aplicação segue a política de eliminação definida para o MVP. A necessidade de confirmação e de recuperação permanece por decidir.

## 5. Decisões pendentes

Antes da implementação, devem ser definidas:
- A confirmação e a eventual recuperação de tarefas eliminadas.
- A apresentação das tarefas concluídas.
- O limite máximo de caracteres dos títulos.
- O comportamento perante dados locais inválidos.
- A eventual inclusão de projetos no MVP.

Os critérios de aceitação devem ser atualizados caso estas decisões alterem o comportamento esperado.