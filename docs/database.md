# Matriz — Modelo de Dados e Diagrama ER

## 1. Objetivo e estado

Este modelo conceptual consolida o âmbito da Ficha 03 com o MVP inicial. Os identificadores e tipos da tabela são conceptuais, salvo os enums de estado/prioridade escolhidos para a ficha; a secção do esquema físico descreve a implementação Prisma/SQLite.

Decisões registadas para o planeamento: cada projeto pertence a uma equipa; estados `TODO`, `IN_PROGRESS`, `DONE`; prioridades `LOW`, `MEDIUM`, `HIGH`. A autenticação usa sessões opacas persistidas no SQLite. A autorização é baseada na pertença à equipa e na propriedade do projeto.

## 2. Entidades e atributos

| Entidade | Atributos conceptuais | Identificadores e regras |
|---|---|---|
| **USER** (Utilizador) | `id`, `name`, `email`, `password_hash` | `id` é PK. `email` identifica a conta e deve ser único. `password_hash` guarda apenas um hash, nunca a palavra-passe em texto simples; não é exposto pela API. |
| **TEAM** (Equipa) | `id`, `name` | `id` é PK. Campos mínimos propostos; gestão de equipas não faz parte das operações especificadas nesta ficha. |
| **TEAM_MEMBERSHIP** (Membro de equipa) | `team_id`, `user_id` | PK composta (`team_id`, `user_id`); FKs para `TEAM` e `USER`. Relação associativa proposta para representar utilizadores em equipas. Se um utilizador pode pertencer a várias equipas aguarda confirmação. Papel/permissão não é atributo definido. |
| **PROJECT** (Projeto) | `id`, `team_id`, `owner_id`, `name`, `description` | `id` é PK; `team_id` é FK obrigatória para `TEAM`; `owner_id` é FK para `USER`, preenchida pelo backend com o utilizador autenticado na criação. É nullable apenas para projetos legados cuja autoria não pode ser inferida com segurança. |
| **TASK** (Tarefa) | `id`, `project_id`, `title`, `description`, `status`, `priority` | `id` é PK; `project_id` é FK obrigatória. `status` ∈ `{TODO, IN_PROGRESS, DONE}`; `priority` ∈ `{LOW, MEDIUM, HIGH}`. |
| **TASK_ASSIGNMENT** (Responsável) | `task_id`, `user_id`, `assigned_at` | PK composta (`task_id`, `user_id`); FKs para `TASK` e `USER`. A chave composta impede duplicar a mesma atribuição. `assigned_at` é definido pelo sistema. |
| **COMMENT** (Comentário) | `id`, `task_id`, `author_id`, `content`, `created_at` | `id` é PK; `task_id` e `author_id` são FKs obrigatórias. Autor vem do utilizador autenticado e `created_at` é definido pelo sistema. |
| **SESSION** (Sessão) | `token_hash`, `csrf_token_hash`, `user_id`, `expires_at`, `created_at` | `token_hash` é PK e contém apenas o SHA-256 do token opaco; `csrf_token_hash` guarda o hash do token CSRF; `user_id` é FK para `USER`; `expires_at` representa validade absoluta de oito horas. |

`name`, `title`, descrições e comprimentos ainda necessitam de validação de regras de campo. O esquema físico inicial usa Prisma/SQLite, identificadores CUID, timestamps geridos pela aplicação e tabelas em `snake_case`; as migrations versionadas ficam em `apps/api/prisma/migrations/`.

Como SQLite não aplica enums Prisma nativos, `TASK.status` e `TASK.priority` são armazenados como texto e limitados por `CHECK` na migration. O cliente Prisma é gerado automaticamente após a instalação das dependências. As relações usam restrição de eliminação, sem cascade, como salvaguarda para não apagar dados dependentes enquanto a política de eliminação não for validada. Esta escolha técnica não substitui a decisão funcional pendente.

## 3. Relações e cardinalidades

| Relação | Cardinalidade | Interpretação / estado |
|---|---|---|
| `TEAM` — `PROJECT` | 1:N | Cada projeto tem exatamente uma equipa; a equipa pode não ter projetos ou ter vários. Decisão registada para a Ficha 03. |
| `TEAM` — `TEAM_MEMBERSHIP` — `USER` | N:M | Modela a associação equipa–utilizador e suporta seleção de membros. Se a pertença a múltiplas equipas é permitida ainda está por validar. |
| `PROJECT` — `TASK` | 1:N | Cada tarefa pertence a um projeto; um projeto pode ainda não ter tarefas ou ter várias. |
| `TASK` — `TASK_ASSIGNMENT` — `USER` | N:M | Uma tarefa pode ter vários responsáveis; um utilizador pode ser responsável por várias tarefas. Só membros da equipa do projeto são elegíveis. |
| `TASK` — `COMMENT` | 1:N | Cada comentário pertence a uma tarefa; a tarefa pode não ter comentários ou ter vários. |
| `USER` — `COMMENT` | 1:N | Cada comentário tem exatamente um autor; um utilizador pode escrever vários comentários. |
| `USER` — `SESSION` | 1:N | Cada sessão pertence a exatamente um utilizador; um utilizador pode ter várias sessões válidas ou expiradas. |
| `USER` — `PROJECT` | 1:N | Cada projeto novo tem como proprietário o utilizador autenticado que o criou; um utilizador pode criar vários projetos. Projetos legados podem não ter proprietário identificado. |

## 4. Diagrama ER

```mermaid
erDiagram
    USER {
        identifier id PK
        string name
        string email UK
        string password_hash
    }

    TEAM {
        identifier id PK
        string name
    }

    TEAM_MEMBERSHIP {
        identifier team_id PK, FK
        identifier user_id PK, FK
    }

    PROJECT {
        identifier id PK
        identifier team_id FK
        identifier owner_id FK
        string name
        string description
    }

    TASK {
        identifier id PK
        identifier project_id FK
        string title
        string description
        string status
        string priority
    }

    TASK_ASSIGNMENT {
        identifier task_id PK, FK
        identifier user_id PK, FK
        datetime assigned_at
    }

    COMMENT {
        identifier id PK
        identifier task_id FK
        identifier author_id FK
        string content
        datetime created_at
    }

    SESSION {
        string token_hash PK
        string csrf_token_hash
        identifier user_id FK
        datetime expires_at
        datetime created_at
    }

    TEAM ||--o{ PROJECT : organizes
    TEAM ||--o{ TEAM_MEMBERSHIP : includes
    USER ||--o{ TEAM_MEMBERSHIP : joins
    PROJECT ||--o{ TASK : contains
    TASK ||--o{ TASK_ASSIGNMENT : has
    USER ||--o{ TASK_ASSIGNMENT : receives
    TASK ||--o{ COMMENT : has
    USER ||--o{ COMMENT : writes
    USER ||--o{ SESSION : authenticates
    USER o|--o{ PROJECT : owns
```

## 5. Integridade e dados derivados

- PKs são únicas e não nulas; FKs devem referenciar registos existentes.
- `PROJECT.team_id`, `TASK.project_id`, `TASK_ASSIGNMENT.task_id/user_id`, `COMMENT.task_id/author_id` e `TEAM_MEMBERSHIP.team_id/user_id` são obrigatórios.
- A chave composta de `TASK_ASSIGNMENT` e `TEAM_MEMBERSHIP` impede pares duplicados.
- Estados e prioridades devem aceitar apenas os valores definidos acima.
- A migration SQLite aplica `CHECK` para os estados e prioridades válidos, além de PKs, unicidade, índices e FKs.
- O painel calcula contagens de tarefas por estado a partir de `TASK`; não deve persistir contagens redundantes.
- `password_hash`, autor e data de comentário não devem ser controláveis pelo cliente.
- `PROJECT.owner_id` é atribuído pela sessão autenticada, nunca por dados enviados pelo cliente.
- A migration de propriedade não atribui um proprietário arbitrário aos projetos legados; o valor fica nulo até existir uma forma fiável de identificar o criador.
- O token de sessão em texto simples nunca é persistido; a aplicação guarda o seu hash e o hash do token CSRF.
- A migration inicial usa restrição de FK para impedir a eliminação de registos com dependências. A política funcional definitiva de eliminação continua por validar.

## 6. Rastreabilidade ao âmbito

| Entidade / relação | Necessidade |
|---|---|
| `USER` | Autenticação, perfil atual, autoria de comentários e atribuições. |
| `TEAM`, `TEAM_MEMBERSHIP`, `PROJECT` | Projetos por equipa, acesso a projetos e seleção de membros elegíveis; regras de acesso/pertença pendentes. |
| `TASK` | Ciclo de vida de tarefas, estado, prioridade, pesquisa e filtros. |
| `TASK_ASSIGNMENT` | Múltiplos responsáveis e remoção de atribuições. |
| `COMMENT` | Comentários de tarefa com autor e data. |
| `SESSION` | Manter a sessão autenticada e o token CSRF sem persistir os tokens em texto simples. |
| Agregação derivada de `TASK.status` | Contagens por estado no painel; não é entidade nem dado persistido. |

## 7. Diferenças face aos anexos e questões pendentes

O modelo anterior dos anexos propunha utilizadores, comentários, atribuições e um proprietário de projeto, mas omitia equipas e a associação projeto–equipa. Esta versão incorpora equipas como parte essencial e não presume proprietário nem papéis sem decisão de autorização.

Antes de implementar, confirmar com o formador:

1. A matriz de permissões de projetos, tarefas, comentários e atribuições.
2. Se a elegibilidade para atribuição equivale a ser membro da equipa do projeto.
3. Se um utilizador pode pertencer a várias equipas.
4. A política de eliminação de projetos/tarefas com dados dependentes.

O esquema Prisma e as migrations versionadas implementam as entidades e relações descritas, incluindo a sessão. As operações de negócio protegidas que dependem das respostas pendentes não devem ser consideradas prontas para implementação.
