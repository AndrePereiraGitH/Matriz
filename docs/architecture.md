# Matriz — Arquitetura e Stack do MVP

## 1. Objetivo e estado da decisão

Este documento compara três estilos arquiteturais e propõe uma opção adequada ao MVP da Matriz, cujo âmbito funcional confirmado é organizar projetos por equipas, gerir e consultar tarefas e acompanhar o progresso.

**Decisão para o plano da Ficha 03:** adotar um monólito modular. A stack aprovada para o MVP é TypeScript, React com Vite, Node.js com Express e SQLite com Prisma. O repositório não continha código nem uma decisão anterior documentada da Aula 02; esta escolha torna o plano executável sem introduzir serviços externos.

## 2. Comparação

| Arquitetura | Vantagens | Desvantagens | Adequação ao MVP |
|---|---|---|---|
| Monólito | Simples de desenvolver, executar e disponibilizar; comunicação direta entre componentes. | Sem limites explícitos, o código pode ficar fortemente acoplado e mais difícil de evoluir. | Viável para começar, mas não explicita fronteiras entre as áreas do domínio. |
| Monólito modular | Mantém uma única aplicação e disponibilização simples, com módulos e responsabilidades bem delimitados. | Exige disciplina para preservar os limites entre módulos; não permite escalar ou disponibilizar cada módulo de forma independente. | **Mais adequado:** equilibra simplicidade operacional com organização suficiente para as áreas de projetos, equipas e tarefas. |
| Microservices | Permite disponibilizar e escalar serviços de forma independente, com autonomia por área. | Acrescenta comunicação de rede, consistência distribuída, observabilidade e esforço operacional. | Não justificado pelo âmbito atual nem por requisitos de escala, disponibilidade ou autonomia de equipas ainda definidos. |

## 3. Decisão para o MVP e justificação

Para o MVP, a Matriz será estruturada como **uma aplicação monolítica com módulos internos bem delimitados**. O frontend React/Vite e a API Express/TypeScript pertencem ao mesmo produto e serão desenvolvidos no mesmo repositório; os módulos de domínio não serão serviços distribuídos. Os módulos serão organizados por responsabilidades e comunicarão através de interfaces internas, sem dependências diretas que contornem os seus limites.

Esta opção responde ao âmbito da Ficha 03 sem introduzir a complexidade de operação distribuída antes de haver uma necessidade comprovada. Ao mesmo tempo, os limites modulares tornam responsabilidades e dependências mais claras e permitem reavaliar a separação de componentes no futuro. A possibilidade de extrair um módulo como serviço independente é uma opção futura, não um objetivo nem uma garantia desta proposta.

## 4. Componentes e responsabilidades

Os componentes seguintes são lógicos e não implicam tecnologias ou processos de execução separados.

| Componente | Responsabilidades |
|---|---|
| Interface da aplicação | Interface React/Vite para autenticação, painel, projetos, tarefas, filtros, responsáveis e comentários; apresentar loading, empty e error states. |
| Aplicação / casos de uso | Coordenar operações da API, validar pedidos e aplicar a política de acesso depois de validada; não duplicar regras dos módulos de domínio. |
| Módulo de autenticação | Iniciar/terminar sessão, expor o utilizador atual e disponibilizar contas de demonstração por seed. Usa sessões opacas persistidas no SQLite, cookie HTTP-only e token CSRF sincronizador nos pedidos de escrita. |
| Módulo de equipas e projetos | Representar equipas e projetos; cada projeto pertence a uma equipa e regista como proprietário o utilizador autenticado que o criou; aplicar acesso de membros e gestão exclusiva pelo proprietário. |
| Módulo de tarefas | Gerir tarefas com estados `TODO`, `IN_PROGRESS`, `DONE` e prioridades `LOW`, `MEDIUM`, `HIGH`; filtrar por estes campos e validar a pertença à equipa do projeto. |
| Módulo de atribuições | Associar membros da equipa do projeto a tarefas e remover associações; validar acesso no backend. |
| Módulo de comentários | Adicionar/listar comentários com autor obtido da sessão autenticada e data atribuída pelo sistema. |
| Módulo de painel | Apresentar projetos acessíveis e contagens de tarefas por estado, sem inventar uma percentagem de progresso. |
| Persistência | Prisma/SQLite para os dados relacionais do MVP; esquema e seed mantidos em migrações versionadas. |

## 5. Limites e questões por resolver

- A arquitetura modular está escolhida para o plano; os módulos não correspondem a serviços independentes.
- A política de autorização aprovada é baseada na pertença à equipa e na propriedade do projeto. A possibilidade de pertença a múltiplas equipas continua por validar.
- A sessão opaca persistida no SQLite, a cookie HTTP-only e a mitigação CSRF estão aprovadas para autenticação. Esta decisão não define a matriz de autorização das operações de negócio.
- Os estados e prioridades das tarefas estão definidos; regras de transição não estão.
- O painel apresenta contagens por estado; outra métrica de progresso do projeto não está definida.
- A política de eliminação de tarefas/comentários/atribuições e projetos/tarefas aguarda definição.
- Requisitos futuros de escala, disponibilidade, segurança ou autonomia operacional poderão justificar uma revisão da arquitetura; não constituem, por si só, uma decisão de adotar microservices.

## 6. Revisão da decisão

Reavaliar a arquitetura quando os requisitos forem validados e houver evidência de que os limites operacionais, de escala ou de autonomia do monólito modular impedem responder às necessidades do produto. Até lá, manter a solução simples e preservar os limites entre módulos.
