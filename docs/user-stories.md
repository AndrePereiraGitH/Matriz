# Matriz — User Stories e Acceptance Criteria

## 1. Introdução

Este documento apresenta as histórias de utilizador iniciais da Matriz.

As histórias foram elaboradas a partir do enquadramento fornecido pelo cliente:

> "Precisamos de uma aplicação onde as nossas equipas possam organizar projetos, gerir tarefas e acompanhar o progresso do trabalho."

Como ainda não foram clarificados todos os detalhes funcionais, algumas histórias representam necessidades gerais e deverão ser refinadas com o cliente.

## 2. User Stories

### US01 — Organizar projetos

**Como** membro de uma equipa,

**Quero** consultar os projetos associados à minha equipa,

**Para** conseguir identificar e acompanhar o trabalho em curso.

**Prioridade:** P0

**Critérios de aceitação:**

- Dado que existem projetos associados à equipa, quando consulto os projetos da equipa, então o sistema apresenta esses projetos.
- Dado que não existem projetos associados à equipa, quando consulto os projetos, então o sistema informa que não existem projetos para apresentar.

### US02 — Associar projetos a equipas

**Como** utilizador responsável pela organização do trabalho,

**Quero** associar projetos a equipas,

**Para** organizar o trabalho de acordo com as equipas responsáveis.

**Prioridade:** P0

**Critérios de aceitação:**

- Quando um projeto é associado a uma equipa, essa associação fica registada no sistema.
- Quando consulto os projetos de uma equipa, devem ser apresentados os projetos associados a essa equipa.

**Regra aprovada:** O projeto só pode ser criado numa equipa de que o utilizador seja membro. O criador é o proprietário e é o único que pode editar ou eliminar o projeto.

### US03 — Gerir tarefas

**Como** membro de uma equipa,

**Quero** consultar e gerir as tarefas dos projetos,

**Para** organizar o trabalho necessário à execução dos projetos.

**Prioridade:** P0

**Critérios de aceitação:**

- Quando consulto um projeto, o sistema apresenta as tarefas associadas a esse projeto.
- Cada tarefa apresentada deve permitir identificar a que projeto pertence.
- O ciclo de vida de criação, consulta, edição e eliminação de tarefas está incluído na Ficha 03 e detalhado em US09.

### US04 — Consultar informação de uma tarefa

**Como** membro de uma equipa,

**Quero** consultar a informação de uma tarefa,

**Para** compreender o trabalho que está associado a essa tarefa.

**Prioridade:** P0

**Critérios de aceitação:**

- Quando seleciono uma tarefa, o sistema apresenta a informação disponível sobre essa tarefa.
- A informação apresentada deve permitir identificar a tarefa e o projeto a que pertence.

**Questão em aberto:** É necessário definir quais os campos obrigatórios de uma tarefa.

### US05 — Acompanhar o progresso de um projeto

**Como** membro de uma equipa,

**Quero** consultar as contagens de tarefas por estado no painel,

**Para** perceber o estado do trabalho realizado e do trabalho ainda pendente.

**Prioridade:** P0

**Critérios de aceitação:**

- No painel inicial, o progresso do projeto é apresentado como contagens de tarefas por estado (`TODO`, `IN_PROGRESS`, `DONE`).
- O painel não apresenta uma percentagem nem um cálculo diferente sem validação adicional.

### US06 — Acompanhar o progresso de uma tarefa

**Como** membro de uma equipa,

**Quero** consultar o progresso de uma tarefa,

**Para** perceber em que ponto se encontra o trabalho.

**Prioridade:** P0

**Critérios de aceitação:**

- Quando consulto uma tarefa, o sistema apresenta o respetivo estado de progresso.
- A informação apresentada corresponde ao estado registado no sistema.
- Os estados definidos para o âmbito da Ficha 03 são `TODO`, `IN_PROGRESS` e `DONE`.
- As regras de transição entre estados ainda precisam de validação.

### US07 — Iniciar e terminar sessão

**Como** utilizador com uma conta de demonstração,

**Quero** iniciar e terminar sessão e consultar o meu perfil autenticado,

**Para** utilizar a aplicação com a minha identidade.

**Prioridade:** P0

**Critérios de aceitação:**

- Credenciais válidas permitem iniciar sessão; credenciais inválidas não autenticam o utilizador.
- O utilizador autenticado consegue consultar o seu perfil.
- Terminar sessão invalida a sessão atual.
- As contas de demonstração são disponibilizadas por seed; registo público e recuperação de palavra-passe ficam fora do MVP.

### US08 — Gerir e pesquisar projetos

**Como** utilizador autorizado,

**Quero** criar, listar, consultar, editar, eliminar e pesquisar projetos,

**Para** organizar o trabalho da equipa.

**Prioridade:** P0

**Critérios de aceitação:**

- O utilizador consegue listar e pesquisar pelo nome os projetos a que tem acesso.
- O utilizador consegue consultar o detalhe de um projeto.
- O utilizador autorizado consegue criar, editar e eliminar projetos.
- O nome do projeto é obrigatório e tem entre 3 e 100 caracteres; a descrição é opcional e tem até 1000 caracteres.
- O nome do projeto não pode conter apenas espaços; a API rejeita dados inválidos com um erro identificando o campo, apresentado pela interface.
- Apenas membros da equipa podem consultar o projeto; apenas o proprietário pode editá-lo ou eliminá-lo.
- Cada projeto pertence a uma única equipa, conforme decisão de planeamento para a Ficha 03.
- A interface não repete uma operação enquanto o pedido está em curso e atualiza o detalhe/listagem com os dados confirmados pela API.

### US09 — Gerir e filtrar tarefas

**Como** utilizador autorizado de um projeto,

**Quero** criar, consultar, editar e eliminar tarefas e definir estado e prioridade,

**Para** organizar e acompanhar o trabalho do projeto.

**Prioridade:** P0

**Critérios de aceitação:**

- As tarefas são associadas ao projeto e a sua consulta identifica esse projeto.
- Os estados aceites são `TODO`, `IN_PROGRESS` e `DONE`.
- As prioridades aceites são `LOW`, `MEDIUM` e `HIGH`.
- O título da tarefa é obrigatório e não pode conter apenas espaços; a API rejeita dados inválidos com um erro identificando o campo, apresentado pela interface.
- O título tem entre 3 e 150 caracteres e a descrição opcional admite até 2000 caracteres.
- Na criação, o estado predefinido é `TODO` e a prioridade predefinida é `MEDIUM`.
- A interface pode apresentar os estados e prioridades em português, mantendo os valores técnicos enviados e recebidos pela API.
- É possível filtrar as tarefas de um projeto por estado e/ou prioridade.
- Apenas membros da equipa do projeto podem consultar e gerir as tarefas.
- A interface pede confirmação antes da eliminação; a eliminação de tarefas com comentários ou atribuições é recusada para preservar os registos dependentes.
- A interface não repete submissões enquanto o pedido está em curso e apresenta a tarefa devolvida pela API sem criar registos locais duplicados.

### US10 — Gerir responsáveis de tarefas

**Como** utilizador autorizado,

**Quero** associar vários utilizadores elegíveis a uma tarefa e remover essas associações,

**Para** identificar os responsáveis pelo trabalho.

**Prioridade:** P0

**Critérios de aceitação:**

- Uma tarefa pode ter mais do que um responsável.
- Uma atribuição existente não é duplicada.
- O Backend confirma que o utilizador existe e pertence à equipa do projeto; utilizadores inexistentes ou não elegíveis não são associados.
- Repetir um pedido de associação já existente mantém uma única atribuição.
- É possível consultar os responsáveis e remover uma atribuição.
- Apenas membros da equipa do projeto são elegíveis; membros podem consultar e gerir atribuições.
- A interface evita repetir operações de atribuição enquanto estão em curso e atualiza a lista a partir da resposta confirmada da API.

### US11 — Comentar tarefas

**Como** utilizador autorizado,

**Quero** adicionar e consultar comentários de uma tarefa,

**Para** registar informação relevante sobre o trabalho.

**Prioridade:** P0

**Critérios de aceitação:**

- Um comentário fica associado à tarefa, ao utilizador autenticado que o escreveu e à data de criação.
- A listagem apresenta autor e data de cada comentário.
- O conteúdo tem entre 1 e 2000 caracteres e não pode conter apenas espaços.
- O cliente não pode indicar ou falsificar o autor ou a data de criação.
- Apenas membros da equipa do projeto podem consultar e adicionar comentários.
- A interface impede submissões repetidas enquanto o pedido está em curso e apresenta o comentário criado pela API sem duplicá-lo na lista.

### US12 — Consultar o painel inicial

**Como** utilizador autenticado,

**Quero** consultar os projetos a que tenho acesso e as contagens de tarefas por estado,

**Para** acompanhar o trabalho e navegar para o detalhe de um projeto.

**Prioridade:** P0

**Critérios de aceitação:**

- O painel apresenta apenas projetos acessíveis ao utilizador conforme a política aprovada.
- Apresenta contagens para `TODO`, `IN_PROGRESS` e `DONE`, incluindo zero quando não existem tarefas nesse estado.
- As contagens por estado são agrupadas por projeto e incluem todas as tarefas acessíveis, sem serem reduzidas pelos filtros ativos da listagem.
- A seleção de um projeto abre o respetivo detalhe.

## 3. Funcionalidades fora do MVP

- Registo público e recuperação de palavra-passe são extensões opcionais.
- Notificações, relatórios avançados, histórico de alterações e outras funcionalidades não indicadas no âmbito da Ficha 03 não são assumidos.

## 4. Observações

As US01–US06 documentam o âmbito inicial. As US07–US12 registam as funcionalidades adicionais explicitamente pedidas para a Ficha 03, conciliadas com o MVP inicial.

As regras de autorização aprovadas são baseadas na pertença à equipa e na propriedade do projeto. Outras regras, como transferência entre equipas e pertença de um utilizador a várias equipas, continuam por validar.