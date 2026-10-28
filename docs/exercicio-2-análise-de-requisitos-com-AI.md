# Exercício 2 — Análise de Requisitos com IA

## 1. Análise das perguntas de clarificação

Como não é possível colocar as perguntas diretamente ao cliente, foram definidos pressupostos razoáveis para avançar com a análise. Estes pressupostos deverão ser validados futuramente.

| Questão | Pressuposto adotado | Estado |
|---|---|---|
| Quem vai utilizar a aplicação? | Inicialmente, pessoas que pretendem organizar individualmente as suas tarefas e projetos. | Pressuposto |
| O que significa “Matriz”? | Uma matriz de Eisenhower, que organiza tarefas segundo a urgência e a importância. | Pressuposto |
| Qual é o principal objetivo? | Facilitar a organização, priorização e acompanhamento de tarefas. | Pressuposto |
| Em que plataforma estará disponível? | Aplicação web acessível através de um navegador. | Pressuposto |
| Quais são as funcionalidades essenciais? | Criar, consultar, editar, eliminar e organizar tarefas nos quatro quadrantes da matriz. | Proposta |
| Como serão guardados os dados? | Armazenamento local no navegador, sem necessidade de uma conta de utilizador na primeira versão. | Pressuposto |
| A aplicação será colaborativa? | Não inicialmente. A partilha de projetos e tarefas poderá ser considerada numa versão futura. | Pressuposto |
| Existem integrações externas? | Não são necessárias para o MVP. | Pressuposto |
| Existem preferências de design? | Interface simples, intuitiva, responsiva e em português de Portugal. | Proposta |

**Nota:** Os pressupostos permitem avançar com a análise, mas não devem ser confundidos com requisitos confirmados pelo cliente.

## 2. Principais tipos de utilizadores

### 2.1. Utilizador individual

É o principal utilizador previsto para a primeira versão da aplicação.

**Necessidades:**
- Criar e gerir tarefas.
- Distinguir tarefas urgentes de tarefas importantes.
- Organizar tarefas por projetos.
- Consultar rapidamente as tarefas prioritárias.
- Manter os dados entre sessões.

### 2.2. Utilizador colaborador — versão futura

Representa uma pessoa que poderá trabalhar com outras pessoas em projetos partilhados.

**Necessidades futuras:**
- Consultar tarefas partilhadas.
- Acompanhar o progresso de projetos comuns.
- Atribuir tarefas a outros utilizadores.
- Comunicar alterações e acompanhar responsabilidades.

Este tipo de utilizador não faz parte do MVP, uma vez que a colaboração exigiria funcionalidades adicionais de autenticação, permissões e armazenamento partilhado.

## 3. Funcionalidades propostas

As prioridades são definidas da seguinte forma:

- **P0 — Essencial:** necessária para o MVP.
- **P1 — Importante:** melhora a experiência, mas pode ficar para uma iteração posterior.
- **P2 — Futura:** funcionalidade que pode ser desenvolvida após validar o MVP.

| ID | Funcionalidade | Justificação | Prioridade |
|---|---|---|---|
| F01 | Visualizar a matriz de Eisenhower com quatro quadrantes. | Permite organizar tarefas segundo a urgência e a importância. | P0 |
| F02 | Criar tarefas com título. | É necessário introduzir as tarefas que o utilizador pretende gerir. | P0 |
| F03 | Definir a urgência e a importância de cada tarefa. | Permite determinar o quadrante adequado para cada tarefa. | P0 |
| F04 | Editar tarefas existentes. | Permite corrigir informações e adaptar as tarefas a novas circunstâncias. | P0 |
| F05 | Eliminar tarefas. | Permite remover tarefas que deixaram de ser necessárias. | P0 |
| F06 | Marcar tarefas como concluídas. | Permite acompanhar o progresso e distinguir tarefas pendentes das terminadas. | P0 |
| F07 | Guardar os dados entre sessões. | Evita que as tarefas desapareçam quando o utilizador fecha o navegador. | P0 |
| F08 | Criar e consultar projetos. | Permite agrupar tarefas relacionadas com objetivos ou atividades diferentes. | P1 |
| F09 | Definir datas limite para as tarefas. | Ajuda a acompanhar prazos e planear o trabalho. | P1 |
| F10 | Pesquisar e filtrar tarefas. | Facilita a consulta quando existem muitas tarefas. | P1 |
| F11 | Disponibilizar uma vista em lista ou calendário. | Oferece formas alternativas de consultar e planear as tarefas. | P1 |
| F12 | Criar contas e autenticar utilizadores. | Permite identificar utilizadores e preparar o acesso individual aos seus dados. | P2 |
| F13 | Partilhar projetos e atribuir tarefas. | Facilita a colaboração entre várias pessoas. | P2 |
| F14 | Enviar notificações e lembretes. | Ajuda o utilizador a recordar prazos e tarefas importantes. | P2 |
| F15 | Sincronizar dados entre dispositivos. | Permite aceder às mesmas tarefas em diferentes dispositivos. | P2 |

## 4. Âmbito do Minimum Viable Product (MVP)

O MVP corresponde à versão mínima da aplicação que permite resolver o problema principal do utilizador e validar se a solução proposta é útil.

### 4.1. Funcionalidades incluídas

O MVP deverá permitir:

1. Visualizar uma matriz de Eisenhower dividida em quatro quadrantes:
   - **Fazer já:** urgente e importante.
   - **Planear:** importante, mas não urgente.
   - **Delegar:** urgente, mas não importante.
   - **Eliminar ou adiar:** nem urgente nem importante.
2. Criar tarefas através de um título.
3. Definir a urgência e a importância das tarefas.
4. Consultar as tarefas no quadrante correspondente.
5. Editar e eliminar tarefas.
6. Marcar tarefas como concluídas.
7. Guardar as tarefas localmente no navegador.
8. Utilizar uma interface simples, intuitiva e adaptável a diferentes tamanhos de ecrã.

### 4.2. Funcionalidades excluídas do MVP

Ficam fora do âmbito inicial:

- Registo e autenticação de utilizadores.
- Partilha de tarefas e projetos.
- Atribuição de tarefas a outras pessoas.
- Sincronização entre dispositivos.
- Notificações e lembretes automáticos.
- Integração com calendários ou outras aplicações.
- Relatórios avançados e estatísticas de produtividade.

Estas funcionalidades poderão ser avaliadas depois de recolher feedback sobre a primeira versão.

### 4.3. Critérios de sucesso do MVP

Considera-se que o MVP cumpre o seu objetivo se:

- O utilizador conseguir criar uma tarefa e colocá-la no quadrante adequado.
- O utilizador conseguir editar, concluir e eliminar tarefas.
- As tarefas continuarem disponíveis depois de fechar e voltar a abrir o navegador, no mesmo ambiente de armazenamento.
- A interface permitir identificar facilmente as tarefas prioritárias.
- Os principais fluxos de utilização funcionarem sem erros.

## 5. Decisões e pressupostos identificados

As seguintes decisões orientam a proposta inicial:

- A aplicação será uma aplicação web.
- A matriz de Eisenhower será o método de organização utilizado.
- A primeira versão será direcionada para utilização individual.
- O armazenamento será local, sem servidor ou base de dados remota.
- A interface estará em português de Portugal.
- O MVP privilegiará as operações essenciais sobre tarefas, evitando funcionalidades avançadas.
- A colaboração e a sincronização serão avaliadas numa fase posterior.

**Riscos e pontos a validar:**

- Confirmar se o cliente pretende realmente uma matriz de Eisenhower.
- Confirmar se a utilização individual é suficiente.
- Validar se o armazenamento local é adequado, considerando que os dados não serão automaticamente partilhados entre dispositivos.
- Confirmar se a gestão de projetos deve fazer parte do MVP ou de uma versão posterior.
- Validar a importância das datas limite e de outras funcionalidades de planeamento.

## 6. Conclusão

A análise de requisitos permitiu transformar uma descrição inicial ambígua numa proposta funcional estruturada, com tipos de utilizadores, funcionalidades, prioridades e um âmbito definido para o MVP.

A principal vantagem foi separar as funcionalidades essenciais das funcionalidades futuras, evitando desenvolver uma solução demasiado complexa antes de validar as necessidades principais.

No entanto, esta proposta continua a basear-se em pressupostos. A análise apoiada por IA permite organizar ideias e identificar possíveis requisitos, mas não substitui a validação com o cliente. As decisões assumidas devem permanecer explícitas para que possam ser revistas antes do desenvolvimento.