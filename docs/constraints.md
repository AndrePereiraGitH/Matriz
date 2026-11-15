# Matriz — Constraints e Pressupostos

## 1. Objetivo

Este documento regista o âmbito, as decisões técnicas aprovadas para o planeamento da Ficha 03 e as regras de negócio que ainda aguardam validação. Propostas não devem ser tratadas como decisões aprovadas.

## 2. Âmbito e restrições da Ficha 03

- A aplicação gere projetos e tarefas de equipas de trabalho.
- O MVP inclui autenticação, operações de ciclo de vida de projetos e tarefas, responsáveis, comentários, pesquisa/filtros e painel inicial.
- Cada projeto pertence a uma única equipa; uma equipa pode ter vários projetos.
- Estados de tarefa: `TODO`, `IN_PROGRESS`, `DONE`.
- Prioridades de tarefa: `LOW`, `MEDIUM`, `HIGH`.
- Contas de demonstração são criadas por seed para simplificar autenticação.
- A seed de demonstração é uma operação explícita, não executada no arranque; usa credenciais locais fictícias e hashes de password. Os fixtures em equipas distintas são dados de teste, não uma decisão sobre autorização.
- Registo público e recuperação de palavra-passe são extensões opcionais, fora do MVP.
- As operações de negócio protegidas não serão implementadas até o plano estar consolidado e as regras de acesso relevantes serem validadas com o formador. Scaffold, configuração e estrutura relacional podem avançar sem definir essas permissões.

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

As seguintes definições são bloqueios para autorização e operações de escrita. Não implementar regras de permissão inferidas:

1. Quem pode listar e consultar projetos, e quem pode criar, editar ou eliminar cada projeto?
2. Quem pode consultar e alterar tarefas?
3. Quem pode consultar ou adicionar comentários?
4. Quem pode associar ou remover responsáveis?
5. Que utilizadores são elegíveis para uma tarefa — por exemplo, membros da equipa do projeto?
6. Pode um utilizador pertencer a mais do que uma equipa?
7. Pode um projeto ser transferido para outra equipa?
8. Eliminar um projeto elimina as respetivas tarefas/comentários, é recusado com dependências ou segue outra política? E eliminar uma tarefa com comentários/atribuições?
9. Qual o mecanismo de sessão/autenticação a adotar para o contrato e a aplicação, e que mitigação CSRF é necessária?
10. As contagens de tarefas por estado do painel são globais ou agrupadas por projeto?

## 6. Segurança e privacidade

- O sistema deve autenticar as operações que exigem identidade e impedir acesso não autorizado; a política concreta aguarda validação.
- Senhas nunca devem ser armazenadas em texto simples; guardar apenas hashes de senha.
- Segredos e credenciais de demonstração não devem ser commitados como valores reais; documentar como as contas seed são inicializadas de forma segura.
- Autoria de comentários deve derivar do utilizador autenticado.
- Consultas e listas devem respeitar a política de acesso validada para evitar exposição de dados de outras equipas.

## 7. Estado

O âmbito da Ficha 03, stack aprovada para o plano, relação projeto–equipa 1:N e enums de tarefa foram registados. A política de autorização, elegibilidade, pertença de utilizadores a equipas, eliminação de dependências e protocolo de sessão continuam pendentes de validação. O plano pode ser preparado, mas incrementos dependentes destas regras ficam bloqueados.
