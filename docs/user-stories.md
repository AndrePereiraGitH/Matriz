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

**Questão em aberto:** É necessário definir quem pode criar projetos e gerir estas associações.

### US03 — Gerir tarefas

**Como** membro de uma equipa,

**Quero** consultar e gerir as tarefas dos projetos,

**Para** organizar o trabalho necessário à execução dos projetos.

**Prioridade:** P0

**Critérios de aceitação:**

- Quando consulto um projeto, o sistema apresenta as tarefas associadas a esse projeto.
- Cada tarefa apresentada deve permitir identificar a que projeto pertence.
- As operações concretas de criação, edição e eliminação de tarefas deverão ser confirmadas com o cliente.

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

**Quero** consultar o progresso de um projeto,

**Para** perceber o estado do trabalho realizado e do trabalho ainda pendente.

**Prioridade:** P0

**Critérios de aceitação:**

- Quando consulto um projeto, o sistema apresenta informação sobre o seu progresso.
- A informação apresentada deve refletir os dados das tarefas associadas ao projeto, de acordo com o mecanismo de cálculo ou acompanhamento que vier a ser definido.

**Questão em aberto:** O progresso será calculado automaticamente a partir das tarefas ou atualizado manualmente?

### US06 — Acompanhar o progresso de uma tarefa

**Como** membro de uma equipa,

**Quero** consultar o progresso de uma tarefa,

**Para** perceber em que ponto se encontra o trabalho.

**Prioridade:** P0

**Critérios de aceitação:**

- Quando consulto uma tarefa, o sistema apresenta o respetivo estado de progresso, caso esteja definido.
- A informação apresentada deve corresponder ao estado registado no sistema.

**Questão em aberto:** É necessário definir os estados possíveis e as regras de transição entre estados.

## 3. Funcionalidades a clarificar

As seguintes histórias poderão ser adicionadas depois de serem validadas com o cliente:

- Atribuir tarefas a membros específicos da equipa;
- Definir prazos e prioridades;
- Adicionar comentários às tarefas;
- Consultar o histórico de alterações;
- Filtrar e pesquisar projetos e tarefas;
- Gerir permissões dos membros;
- Receber notificações sobre alterações;
- Consultar relatórios de progresso.

Estas funcionalidades não devem ser consideradas requisitos confirmados enquanto não forem validadas.

## 4. Observações

As histórias de utilizador apresentadas representam uma primeira interpretação das necessidades do cliente.

Os critérios de aceitação definem comportamentos gerais que podem ser verificados, mas alguns dependem de decisões ainda em aberto.

Antes da implementação, será necessário refinar as histórias, definir os campos e regras de negócio e validar os critérios de aceitação.