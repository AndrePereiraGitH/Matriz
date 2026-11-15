# Matriz — Constraints e Pressupostos

## 1. Objetivo

Este documento regista o âmbito, as decisões técnicas aprovadas para o planeamento da Ficha 03 e as regras de negócio que ainda aguardam validação. Propostas não devem ser tratadas como decisões aprovadas.

## 2. Âmbito e restrições da Ficha 03

- A aplicação gere projetos e tarefas de equipas de trabalho.
- O MVP inclui autenticação, operações de ciclo de vida de projetos e tarefas, responsáveis, comentários, pesquisa/filtros e painel inicial.
- Cada projeto pertence a uma única equipa; uma equipa pode ter vários projetos.
- Estados de tarefa: `TODO`, `IN_PROGRESS`, `DONE`.
- Prioridades de tarefa: `LOW`, `MEDIUM`, `HIGH`.
- Título de tarefa: obrigatório, entre 3 e 150 caracteres; descrição opcional até 2000 caracteres; valores iniciais `TODO` e `MEDIUM`.
- A interface pode traduzir estados e prioridades, mantendo os valores técnicos no contrato da API.
- Contas de demonstração são criadas por seed para simplificar autenticação.
- A seed de demonstração é uma operação explícita, não executada no arranque; usa credenciais locais fictícias e hashes de password. Os fixtures em equipas distintas são dados de teste, não uma decisão sobre autorização.
- Registo público e recuperação de palavra-passe são extensões opcionais, fora do MVP.
- Regras de autorização aprovadas para o MVP: só membros da equipa podem consultar projetos e respetivos recursos; o utilizador que cria um projeto é o seu proprietário e é o único que o pode editar ou eliminar; membros da equipa podem gerir tarefas, comentários e atribuições; apenas membros da equipa são elegíveis para atribuição.
- Eliminações de projetos com tarefas e de tarefas com comentários ou atribuições são recusadas (HTTP 409); a base de dados usa chaves estrangeiras restritivas para evitar registos órfãos. A interface de projetos pede confirmação antes da tentativa de eliminação.

## 3. Stack e arquitetura registadas

O repositório não continha uma decisão da Aula 02 nem manifestos/código que revelassem uma stack existente. Para viabilizar o planeamento, foi aprovada esta proposta simples:

- TypeScript no frontend e backend;
- React com Vite para a interface;
- Node.js com Express para a API REST;
- SQLite com Prisma para persistência;
- Monólito modular como arquitetura da aplicação.

Esta escolha não introduz serviços externos. Detalhes de desenvolvimento, alojamento e autenticação devem ser documentados antes de implementação se afetarem a segurança ou a operação.

## 4. Pressupostos de modelação

- `TEAM`, `PROJECT` e `TASK` são entidades do domínio.
- Cada projeto pertence exatamente a uma equipa, conforme decisão fornecida para a Ficha 03.
- Para representar contas e vários responsáveis elegíveis, o modelo precisará de `USER`, associação de utilizadores a equipas, `TASK_ASSIGNMENT` e `COMMENT`.
- A associação a equipas é uma proposta N:M para permitir utilizadores em equipas; confirmar com o formador se um utilizador pode pertencer a várias equipas.
- O painel apresenta contagens por estado; não se presume uma percentagem adicional de progresso.
- O autor e a data de comentário são registados pelo sistema, não escolhidos pelo cliente.

## 5. Decisões pendentes do formador

As seguintes definições continuam por esclarecer. Não inferir regras adicionais:

1. Pode um utilizador pertencer a mais do que uma equipa?
2. Pode um projeto ser transferido para outra equipa?

## 6. Segurança e privacidade

- O sistema deve autenticar as operações protegidas e aplicar autorização por pertença à equipa e propriedade do projeto como definido acima.
- O mecanismo de autenticação aprovado para a aplicação é uma sessão opaca persistida no SQLite, transportada por cookie HTTP-only com validade absoluta de oito horas. Pedidos autenticados de escrita exigem token CSRF sincronizador.
- Senhas nunca devem ser armazenadas em texto simples; guardar apenas hashes de senha.
- Segredos e credenciais de demonstração não devem ser commitados como valores reais; documentar como as contas seed são inicializadas de forma segura.
- Autoria de comentários deve derivar do utilizador autenticado.
- O backend filtra listas e valida acesso individual a cada projeto antes de ler ou alterar tarefas, comentários e atribuições; a mesma proteção aplica-se a pedidos diretos à API.

## 7. Estado

O âmbito da Ficha 03, stack aprovada para o plano, relação projeto–equipa 1:N, enums de tarefa, mecanismo de sessão, política de autorização, proteção contra eliminação de registos com dependências e contagens de tarefas por estado agrupadas por projeto foram registados. A pertença a múltiplas equipas e a transferência de projetos continuam pendentes.
