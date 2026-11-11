# Matriz — Architecture Pack do MVP (revisão crítica)

## 1. Objetivo e estado

Este pack resume e revê a coerência entre requisitos, arquitetura, modelo de dados, contrato API e wireframe para o MVP da Matriz. É uma síntese de propostas e lacunas; não substitui os documentos de origem nem aprova decisões de negócio ainda pendentes.

O âmbito confirmado é organizar projetos por equipas, gerir tarefas associadas e acompanhar o progresso. A solução continua na fase de análise e especificação.

## 2. Proposta de arquitetura

Recomenda-se um **monólito modular** para o MVP: uma aplicação e uma unidade de disponibilização, organizada internamente por responsabilidades e interfaces claras. Esta proposta evita a complexidade distribuída dos microservices e explicita limites entre as áreas do domínio.

Componentes lógicos:

| Componente | Responsabilidade no MVP |
|---|---|
| Interface | Apresentar projetos da equipa e tarefas do projeto selecionado. |
| Aplicação / casos de uso | Coordenar consultas e operações funcionais que venham a ser validadas. |
| Equipas e projetos | Representar equipas, projetos e a sua associação. |
| Tarefas | Representar tarefas associadas a projetos e respetivos dados validados. |
| Progresso | Expor informação de progresso após definição do respetivo mecanismo. |
| Persistência | Guardar e consultar dados sem tecnologia escolhida nesta fase. |

A proposta e a comparação arquitetural estão em [architecture.md](./architecture.md). Não estão escolhidos linguagem, frameworks, base de dados, alojamento nem mecanismos de autenticação ou autorização.

## 3. Coerência entre artefactos

| Artefacto | Conteúdo atual | Avaliação |
|---|---|---|
| [requirements.md](./requirements.md) e [user-stories.md](./user-stories.md) | Requisitos P0 para projetos, equipas, tarefas e progresso; seis histórias iniciais. | Fonte funcional. Detalhes de negócio permanecem em aberto. |
| [database.md](./database.md) | Entidades `TEAM`, `PROJECT` e `TASK`; relações equipa–projeto e projeto–tarefa. | Alinhado ao domínio mínimo. Cardinalidades e alguns campos são pressupostos explícitos por validar. |
| [architecture.md](./architecture.md) | Proposta de monólito modular e componentes lógicos. | Coerente com a dimensão atual; não seleciona tecnologia. |
| [openapi.yaml](../openapi.yaml) | Duas consultas: projetos por equipa e tarefas por projeto. | Adequado ao exercício simplificado; não cobre toda a gestão de tarefas nem progresso. |
| [wireframe-dashboard.svg](./ui/wireframe-dashboard.svg) | Consulta de projetos e tarefas, com estados de carregamento, vazio e erro. | Alinhado com US01 e US03; conteúdo ilustrativo. Não representa criação, edição ou acesso autenticado. |

## 4. Inconsistências e omissões encontradas

### 4.1. Proposta de arquitetura versus estado no README — corrigido

O [README.md](../README.md) dizia que ainda não havia arquitetura escolhida, embora [architecture.md](./architecture.md) já documentasse uma proposta para o MVP. O README foi atualizado para reconhecer a proposta de monólito modular e distinguir essa decisão das tecnologias ainda não escolhidas. A arquitetura continua identificada como proposta sujeita a validação antes da implementação.

### 4.2. Progresso é requisito, mas o mecanismo está por definir — pendente

RF05 e US05/US06 requerem acompanhamento de progresso. O modelo propõe um campo de estado para tarefas, mas não define valores nem transições; também não persiste um valor de progresso do projeto. O contrato API não devolve progresso e o wireframe assinala esta lacuna.

Isto é uma **lacuna funcional ainda não resolvida**, não uma contradição a corrigir inventando estados, percentagens ou cálculos. A definição do progresso é necessária para completar o modelo e o contrato.

### 4.3. Utilizadores, pertença às equipas e autorização — pendente

As histórias falam de membros de uma equipa, mas o modelo não representa utilizadores nem a relação utilizador–equipa. O contrato API não define autenticação ou autorização. Sem essas decisões, não se consegue determinar como a aplicação identifica a equipa de um membro ou controla o acesso.

A ausência de segurança no contrato é agora explicitamente descrita como **não especificada**, e não como autorização para acesso público. A seleção/pertença a equipas no wireframe também deixou de parecer um controlo funcional definido.

### 4.4. Cardinalidade equipa–projeto — pressuposto visível

O modelo assume provisoriamente que cada projeto pertence a uma equipa, embora os requisitos deixem em aberto se um projeto pode pertencer a várias. Se a relação for N:M, o modelo precisará de uma entidade associativa e o contrato deverá refletir a regra acordada.

### 4.5. Cobertura limitada do contrato API — intencional no exercício

As duas operações documentadas cobrem a consulta de projetos por equipa e de tarefas por projeto. Não cobrem consulta detalhada de uma tarefa (US04), operações de criação/edição/eliminação de tarefas, nem progresso (US05/US06). Como o exercício pede pelo menos duas operações, esta limitação é aceitável para o artefacto simplificado, mas não corresponde a uma API completa do MVP.

Os identificadores inteiros positivos da API são uma representação proposta no contrato HTTP; não impõem que a persistência use inteiros, cuja tecnologia e tipos físicos continuam por decidir.

### 4.6. Conteúdo ilustrativo no wireframe — explicitado

Os nomes dos projetos e tarefas são dados fictícios. O wireframe representa consultas e estados de interface, não funcionalidades de edição, atribuição, prioridade, estado ou gestão de utilizadores.

## 5. Perguntas que bloqueiam o desenho final

1. O progresso das tarefas será um estado, uma percentagem ou outra representação? Quais os valores e regras?
2. O progresso do projeto será calculado a partir das tarefas ou atualizado manualmente?
3. Um projeto pode pertencer a mais do que uma equipa?
4. Os utilizadores têm contas? Como se relacionam com equipas e que permissões existem?
5. Quais os campos mínimos aprovados para projetos e tarefas? Atribuições, prioridades, prazos, comentários ou histórico fazem parte do MVP?
6. São necessários detalhes de uma tarefa ou operações de escrita no contrato API do exercício?

## 6. Resultado e validação

Foram feitas correções de consistência no estado arquitetural do README, no texto do contrato API e na indicação do contexto de equipa do wireframe. Os requisitos funcionais não foram alterados e não foram inventadas regras para as questões pendentes.

O pack está coerente como **proposta preliminar** para os artefactos produzidos. Não deve ser considerado especificação completa para implementação até serem validados, no mínimo, o mecanismo de progresso e as regras de pertença e acesso às equipas.
