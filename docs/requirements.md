# Matriz — Requirements

## 1. Visão da aplicação

A Matriz é uma aplicação web de gestão e organização de tarefas que pretende ajudar os utilizadores a identificar prioridades e a organizar melhor o seu trabalho.

A proposta inicial utiliza a matriz de Eisenhower para classificar tarefas segundo dois critérios: urgência e importância.

Esta definição parte de um pressuposto que ainda deverá ser validado: a matriz de Eisenhower é o conceito pretendido para a aplicação.

## 2. Objetivos

- Facilitar a criação e gestão de tarefas.
- Ajudar a distinguir tarefas urgentes de tarefas importantes.
- Permitir uma visualização rápida das prioridades.
- Preservar as tarefas entre sessões de utilização.
- Disponibilizar uma interface simples e acessível através de um navegador.

## 3. Tipos de utilizadores

### 3.1. Utilizador individual

É o utilizador principal previsto para o MVP.

Necessidades:
- Criar, consultar, editar e eliminar tarefas.
- Classificar tarefas por urgência e importância.
- Marcar tarefas como concluídas.
- Consultar as tarefas organizadas nos quatro quadrantes.

### 3.2. Utilizador colaborador — futuro

Poderá participar em projetos partilhados com outros utilizadores.

Esta possibilidade não faz parte do MVP e depende da futura implementação de autenticação, permissões e armazenamento partilhado.

## 4. Requisitos funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RF01 | A aplicação deve apresentar uma matriz dividida em quatro quadrantes. | P0 |
| RF02 | O utilizador deve conseguir criar tarefas com um título válido. | P0 |
| RF03 | O utilizador deve conseguir definir a urgência e a importância de cada tarefa. | P0 |
| RF04 | A aplicação deve colocar cada tarefa no quadrante correspondente à sua classificação. | P0 |
| RF05 | O utilizador deve conseguir editar tarefas existentes. | P0 |
| RF06 | O utilizador deve conseguir eliminar tarefas. | P0 |
| RF07 | O utilizador deve conseguir marcar tarefas como concluídas ou não concluídas. | P0 |
| RF08 | A aplicação deve guardar e recuperar as tarefas através do armazenamento local do navegador. | P0 |
| RF09 | A aplicação deve permitir agrupar tarefas por projeto. | P1 |
| RF10 | O utilizador deve conseguir definir datas limite para as tarefas. | P1 |
| RF11 | A aplicação poderá disponibilizar pesquisa e filtros de tarefas. | P1 |
| RF12 | A aplicação poderá disponibilizar vistas alternativas, como lista ou calendário. | P1 |
| RF13 | A aplicação poderá suportar contas de utilizador e autenticação. | P2 |
| RF14 | A aplicação poderá permitir partilhar projetos e atribuir tarefas. | P2 |
| RF15 | A aplicação poderá disponibilizar notificações e sincronização entre dispositivos. | P2 |

**Prioridades:** P0 = MVP; P1 = iteração posterior; P2 = funcionalidade futura.

## 5. Requisitos não funcionais

| ID | Requisito | Critério ou intenção |
|---|---|---|
| RNF01 | Usabilidade | A interface deve permitir identificar os quatro quadrantes e as ações principais sem ambiguidade. |
| RNF02 | Compatibilidade | A aplicação deverá funcionar nos navegadores modernos selecionados para os testes. |
| RNF03 | Responsividade | A interface deverá adaptar-se a diferentes tamanhos de ecrã. |
| RNF04 | Persistência | As tarefas guardadas devem continuar disponíveis depois de fechar e reabrir a aplicação no mesmo navegador e ambiente de armazenamento. |
| RNF05 | Integridade | A edição de uma tarefa não deve criar duplicados nem perder dados não alterados. |
| RNF06 | Tratamento de erros | A aplicação deve informar o utilizador quando não consegue guardar ou recuperar os dados. |
| RNF07 | Privacidade | O MVP não deverá transmitir tarefas para um servidor externo. |
| RNF08 | Manutenibilidade | O código deverá ser organizado de forma a facilitar alterações e testes futuros. |

Os requisitos não funcionais são objetivos iniciais. Critérios quantitativos de desempenho, acessibilidade e compatibilidade deverão ser definidos quando forem conhecidos os requisitos técnicos.

## 6. Âmbito do MVP

O MVP deverá incluir:

- Visualização dos quatro quadrantes da matriz de Eisenhower.
- Criação de tarefas com título.
- Classificação por urgência e importância.
- Edição e eliminação de tarefas.
- Marcação de tarefas como concluídas e não concluídas.
- Persistência local dos dados.
- Validação de títulos vazios.
- Tratamento básico de erros de armazenamento.
- Interface responsiva e em português de Portugal.

### Critérios de sucesso

O MVP deverá permitir que um utilizador:
1. Crie uma tarefa válida.
2. Classifique a tarefa e a visualize no quadrante correto.
3. Edite, conclua e elimine a tarefa.
4. Feche e reabra a aplicação sem perder os dados que foram guardados com sucesso.

## 7. Funcionalidades fora do âmbito inicial

Ficam fora do MVP:

- Registo, autenticação e gestão de contas.
- Partilha de tarefas e projetos.
- Atribuição de tarefas a outros utilizadores.
- Sincronização entre dispositivos.
- Notificações automáticas.
- Integrações com calendários e serviços externos.
- Relatórios avançados de produtividade.
- Gestão de projetos, pesquisa, filtros e vistas alternativas, salvo decisão posterior de alterar o âmbito.

## 8. Questões por validar

- Confirmar se a matriz de Eisenhower corresponde à intenção original do projeto.
- Confirmar se o armazenamento local é suficiente.
- Definir o comportamento das tarefas concluídas na interface.
- Definir a política de confirmação e recuperação de tarefas eliminadas.
- Definir o limite máximo de caracteres dos títulos.
- Selecionar os navegadores e os critérios de acessibilidade a suportar.

Estas questões não devem ser tratadas como decisões confirmadas até serem revistas.