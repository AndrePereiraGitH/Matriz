# Matriz — Architecture Pack do MVP

## 1. Objetivo e estado

Este pack consolida arquitetura, dados, API e interface para a Ficha 03. As regras de autorização de negócio estão aprovadas e aplicadas na API; algumas políticas de dados e a interface de domínio continuam por concluir. O plano executável está em [implementation-plan.md](./implementation-plan.md). O scaffold, persistência, autenticação e endpoints protegidos estão implementados.

## 2. Arquitetura e stack

Foi escolhida para o plano uma aplicação em **monólito modular**:

- TypeScript no frontend e backend;
- React com Vite para a interface;
- Node.js com Express para a API;
- SQLite com Prisma para persistência.

Esta stack suporta desenvolvimento local de ponta a ponta sem microservices ou serviços externos. Responsabilidades lógicas: autenticação; equipas/projetos; tarefas; atribuições; comentários; painel; persistência. Ver [architecture.md](./architecture.md).

## 3. Modelo de dados

[database.md](./database.md) modela `USER`, `TEAM`, `TEAM_MEMBERSHIP`, `PROJECT`, `TASK`, `TASK_ASSIGNMENT`, `COMMENT` e `SESSION`. Cada projeto pertence a uma equipa. Estados e prioridades estão limitados aos valores aprovados. As contagens de tarefas do painel são dados derivados, não persistidos.

A elegibilidade de responsáveis e a autorização seguem a política aprovada: membros da equipa podem consultar e gerir os recursos do projeto; apenas o proprietário pode editar/eliminar o projeto; responsáveis são membros da equipa. A pertença a múltiplas equipas, transferência de projetos e política de eliminação continuam pendentes.

## 4. API

[openapi.yaml](../openapi.yaml) documenta autenticação, equipas selecionáveis, projetos CRUD/pesquisa, tarefas CRUD/filtros, responsáveis elegíveis e atribuídos, comentários e painel. Inclui contratos de erro e respostas de autenticação/autorização.

A sessão opaca persistida no SQLite, a cookie HTTP-only de oito horas e o token CSRF sincronizador estão implementados. A API valida a pertença à equipa em pedidos de projetos, tarefas, comentários e atribuições; o proprietário é inferido da sessão na criação do projeto.

## 5. Interface

[wireframe-dashboard.svg](./ui/wireframe-dashboard.svg) representa o painel com projetos, pesquisa, contagens por estado, filtros de tarefas e estados loading/empty/error. Os dados são ilustrativos; componentes de outras operações serão detalhados durante os incrementos de UI.

## 6. Reconciliação com o MVP inicial

O MVP original cobria projetos associados a equipas, tarefas e acompanhamento de progresso. A Ficha 03 concretiza esse âmbito e acrescenta explicitamente autenticação, CRUD, estado/prioridade, responsáveis, comentários, pesquisa/filtros e painel inicial. As extensões opcionais (registo público e recuperação de palavra-passe) ficam fora do MVP.

O acompanhamento do painel é concretizado por contagens por estado; não se presume uma percentagem de progresso. O wireframe e o contrato propõem agrupar as contagens por projeto, o que ainda deve ser confirmado. Valores de estado e prioridade foram escolhidos para esta ficha. A cardinalidade projeto–equipa foi definida como 1:N.

## 7. Decisões necessárias antes da implementação

Validar com o formador e atualizar os artefactos relacionados:

1. Possibilidade de um utilizador pertencer a várias equipas.
2. Se um projeto pode ser transferido para outra equipa.
3. Se o painel agrupa contagens por projeto ou apresenta totais globais.
4. Política de eliminação de projetos/tarefas com dados dependentes.

Estas pendências estão refletidas no plano e não devem ser resolvidas por suposições do agente.
