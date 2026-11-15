# Matriz — Requisitos do Sistema

## 1. Visão geral

A Matriz é uma aplicação destinada à gestão de projetos e tarefas de equipas de trabalho.

A aplicação deverá permitir que as equipas organizem os seus projetos, façam a gestão das tarefas e acompanhem o progresso do trabalho.

A especificação parte da seguinte descrição fornecida pelo cliente:

> "Precisamos de uma aplicação onde as nossas equipas possam organizar projetos, gerir tarefas e acompanhar o progresso do trabalho."

O objetivo é transformar esta necessidade numa especificação clara, consistente e verificável.

## 2. Âmbito do sistema

O âmbito da Ficha 03 consolida o MVP inicial com as funcionalidades necessárias à implementação académica:

1. Autenticação: iniciar e terminar sessão e consultar o utilizador autenticado.
2. Projetos: criar, listar, consultar, editar e eliminar projetos a que o utilizador tenha acesso; pesquisar pelo nome.
3. Tarefas: criar, consultar, editar e eliminar tarefas de um projeto; definir estado e prioridade; filtrar por ambos.
4. Responsáveis: associar vários utilizadores elegíveis a uma tarefa e remover atribuições.
5. Comentários: adicionar e listar comentários de uma tarefa, identificando autor e data.
6. Painel inicial: apresentar projetos acessíveis, contagens de tarefas por estado e navegação para o detalhe.

Esta expansão concretiza capacidades do MVP original, mas não confirma automaticamente as regras de autorização. A matriz de permissões e a regra de elegibilidade dos responsáveis continuam pendentes de validação com o formador.

## 3. Requisitos funcionais

Os requisitos seguintes consolidam o enquadramento inicial do cliente com o âmbito funcional fornecido para a Ficha 03. As regras não especificadas continuam identificadas como questões em aberto.

| ID | Requisito | Prioridade |
|---|---|---|
| RF01 | O sistema deve permitir organizar o trabalho em projetos. | P0 |
| RF02 | O sistema deve permitir associar projetos a equipas de trabalho. | P0 |
| RF03 | O sistema deve permitir criar, consultar, editar e eliminar tarefas associadas a projetos. | P0 |
| RF04 | O sistema deve permitir consultar a informação das tarefas. | P0 |
| RF05 | O sistema deve permitir acompanhar o trabalho através do estado das tarefas e apresentar contagens de tarefas por estado no painel. | P0 |
| RF06 | O sistema deve permitir iniciar e terminar sessão e consultar o utilizador autenticado. | P0 |
| RF07 | O sistema deve permitir criar, listar, consultar, editar e eliminar projetos acessíveis ao utilizador. | P0 |
| RF08 | Cada tarefa deve ter um estado (`TODO`, `IN_PROGRESS`, `DONE`) e uma prioridade (`LOW`, `MEDIUM`, `HIGH`). | P0 |
| RF09 | O sistema deve permitir associar vários utilizadores elegíveis a uma tarefa e remover essas associações. | P0 |
| RF10 | O sistema deve permitir adicionar e listar comentários de uma tarefa, incluindo autor e data. | P0 |
| RF11 | O sistema deve permitir pesquisar projetos pelo nome e filtrar tarefas por estado e prioridade. | P0 |
| RF12 | O painel inicial deve apresentar projetos acessíveis, contagens de tarefas por estado e permitir navegar para o detalhe de um projeto. | P0 |

Os valores de estado e prioridade acima foram aprovados para o planeamento da Ficha 03. As regras de transição entre estados ainda não estão definidas.

### 3.1. Regras e detalhes por esclarecer

Os seguintes comportamentos precisam de ser discutidos e validados antes de orientar a implementação:

- Que papéis podem criar, editar ou eliminar projetos?
- A edição de um projeto pode transferi-lo para outra equipa?
- Quem pode consultar ou alterar tarefas, comentar ou gerir atribuições?
- Que utilizadores são elegíveis para atribuição a uma tarefa?
- Um utilizador pode pertencer a várias equipas?
- As contagens de tarefas por estado são globais no painel ou agrupadas por projeto?
- As transições entre estados de tarefa são livres ou sujeitas a regras?
- O progresso do projeto é representado apenas por contagens por estado ou requer outro indicador?
- O que acontece às tarefas, atribuições e comentários quando um projeto ou tarefa é eliminado?
- Que regras de validação e limites de texto devem aplicar-se aos campos?

## 4. Requisitos não funcionais

O cliente ainda não forneceu requisitos não funcionais específicos.

As seguintes dimensões deverão ser analisadas durante a especificação:

| ID | Dimensão | Questão a considerar |
|---|---|---|
| RNF01 | Usabilidade | A aplicação deverá ser fácil de utilizar pelos membros das equipas? |
| RNF02 | Desempenho | Que tempos de resposta são aceitáveis? |
| RNF03 | Segurança | Como serão protegidos os dados dos projetos e das equipas? |
| RNF04 | Privacidade | Que informação dos utilizadores deverá ser armazenada e quem poderá consultá-la? |
| RNF05 | Disponibilidade | Que nível de disponibilidade é esperado? |
| RNF06 | Compatibilidade | Em que dispositivos e navegadores deverá funcionar? |
| RNF07 | Escalabilidade | Quantas equipas, projetos e tarefas deverá suportar? |
| RNF08 | Manutenção | Que requisitos deverão facilitar a evolução futura da aplicação? |

Estas dimensões são pontos de análise, não requisitos técnicos já aprovados.

## 5. Priorização

As capacidades RF01–RF12 são P0 para o âmbito de implementação da Ficha 03:

- Autenticação básica para contas de demonstração;
- Ciclo de vida e pesquisa de projetos;
- Ciclo de vida e filtros de tarefas;
- Atribuições e comentários;
- Painel inicial com contagens por estado.

## 6. Fora do âmbito e extensões opcionais

O registo público e a recuperação de palavra-passe são extensões opcionais e não fazem parte do MVP desta ficha. Também não estão confirmadas aplicações móveis, integrações externas, notificações automáticas, relatórios avançados, faturação, funcionalidades de inteligência artificial ou automatização de fluxos de trabalho.

## 7. Questões por validar antes da implementação

1. Qual é a matriz exata de permissões por papel para projetos, tarefas, comentários e atribuições?
2. Como se define um utilizador elegível para ser responsável por uma tarefa?
3. Que política de eliminação se aplica a projetos e tarefas com dados dependentes?
4. É necessária uma representação do progresso do projeto além das contagens por estado no painel?
5. Que requisitos de segurança, desempenho, disponibilidade e retenção de dados devem ser aplicados?

## 8. Estado da especificação

Este documento consolida o âmbito inicial com a Ficha 03. O âmbito funcional indicado na secção 3 foi fornecido para esta ficha; a autorização detalhada, a elegibilidade de responsáveis e as regras de eliminação permanecem pendentes.

O contrato, o modelo de dados e o plano de implementação devem ser mantidos alinhados com estas distinções entre âmbito confirmado e regras por validar.