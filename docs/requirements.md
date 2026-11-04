# Matriz — Requisitos do Sistema

## 1. Visão geral

A Matriz é uma aplicação destinada à gestão de projetos e tarefas de equipas de trabalho.

A aplicação deverá permitir que as equipas organizem os seus projetos, façam a gestão das tarefas e acompanhem o progresso do trabalho.

A especificação parte da seguinte descrição fornecida pelo cliente:

> "Precisamos de uma aplicação onde as nossas equipas possam organizar projetos, gerir tarefas e acompanhar o progresso do trabalho."

O objetivo é transformar esta necessidade numa especificação clara, consistente e verificável.

## 2. Âmbito do sistema

O âmbito inicial da Matriz centra-se em três áreas:

1. Organização de projetos por equipas de trabalho.
2. Gestão das tarefas associadas aos projetos.
3. Acompanhamento do progresso do trabalho.

A forma concreta como estas funcionalidades serão implementadas ainda não está definida.

## 3. Requisitos funcionais

Os requisitos seguintes representam necessidades identificadas a partir do enquadramento do cliente. Os detalhes que não foram fornecidos pelo cliente estão identificados como questões em aberto.

| ID | Requisito | Prioridade |
|---|---|---|
| RF01 | O sistema deve permitir organizar o trabalho em projetos. | P0 |
| RF02 | O sistema deve permitir associar projetos a equipas de trabalho. | P0 |
| RF03 | O sistema deve permitir gerir tarefas associadas aos projetos. | P0 |
| RF04 | O sistema deve permitir consultar a informação das tarefas. | P0 |
| RF05 | O sistema deve permitir acompanhar o progresso dos projetos e das tarefas. | P0 |

### 3.1. Detalhes por esclarecer

Os seguintes comportamentos precisam de ser discutidos e validados antes de serem definidos como requisitos:

- Criação, edição e eliminação de projetos;
- Criação, edição e eliminação de tarefas;
- Atribuição de tarefas a membros da equipa;
- Estados possíveis para as tarefas;
- Definição de prioridades e prazos;
- Organização das tarefas através de listas, quadros ou outras visualizações;
- Registo do progresso através de estados, percentagens ou outro mecanismo;
- Existência de comentários ou histórico de alterações;
- Diferentes níveis de permissões para os utilizadores.

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

A prioridade P0 identifica as capacidades fundamentais para responder à necessidade inicial do cliente:

- Organização de projetos;
- Associação de projetos a equipas;
- Gestão de tarefas;
- Consulta de tarefas;
- Acompanhamento do progresso.

A prioridade e o âmbito das restantes funcionalidades deverão ser definidos após clarificação dos requisitos.

## 6. Fora do âmbito confirmado

Não existem funcionalidades adicionais confirmadas pelo cliente nesta fase.

Por isso, não se deve assumir como parte do âmbito:

- Aplicações móveis nativas;
- Integrações com ferramentas externas;
- Notificações automáticas;
- Relatórios avançados;
- Gestão de faturação;
- Funcionalidades de inteligência artificial;
- Automatização de fluxos de trabalho.

Estas funcionalidades poderão ser avaliadas futuramente, caso exista uma necessidade identificada.

## 7. Questões em aberto

Antes de avançar para o desenho detalhado da solução, será necessário esclarecer:

1. Como são criadas e geridas as equipas?
2. Um utilizador pode pertencer a várias equipas?
3. Como são criados e geridos os projetos?
4. Um projeto pode pertencer a mais do que uma equipa?
5. Como são criadas e atribuídas as tarefas?
6. Que estados e prioridades podem ter as tarefas?
7. Como deve ser representado o progresso de um projeto?
8. Que permissões existem para os diferentes utilizadores?
9. É necessário manter um histórico de alterações?
10. Que requisitos de segurança, desempenho e disponibilidade são esperados?

## 8. Estado da especificação

Este documento representa uma primeira versão da especificação, baseada exclusivamente no enquadramento inicial fornecido pelo cliente.

Os requisitos funcionais apresentados identificam as capacidades principais da aplicação. Os detalhes ainda não confirmados permanecem como questões em aberto.

A especificação deverá ser atualizada à medida que forem obtidas respostas e validadas decisões.