# Matriz — Proposta de Arquitetura para o MVP

## 1. Objetivo e estado da decisão

Este documento compara três estilos arquiteturais e propõe uma opção adequada ao MVP da Matriz, cujo âmbito funcional confirmado é organizar projetos por equipas, gerir e consultar tarefas e acompanhar o progresso.

**Proposta:** adotar um monólito modular para o MVP. Esta é uma recomendação arquitetural para orientar a especificação; não seleciona tecnologias, base de dados, alojamento ou mecanismos de autenticação, que permanecem por decidir.

## 2. Comparação

| Arquitetura | Vantagens | Desvantagens | Adequação ao MVP |
|---|---|---|---|
| Monólito | Simples de desenvolver, executar e disponibilizar; comunicação direta entre componentes. | Sem limites explícitos, o código pode ficar fortemente acoplado e mais difícil de evoluir. | Viável para começar, mas não explicita fronteiras entre as áreas do domínio. |
| Monólito modular | Mantém uma única aplicação e disponibilização simples, com módulos e responsabilidades bem delimitados. | Exige disciplina para preservar os limites entre módulos; não permite escalar ou disponibilizar cada módulo de forma independente. | **Mais adequado:** equilibra simplicidade operacional com organização suficiente para as áreas de projetos, equipas e tarefas. |
| Microservices | Permite disponibilizar e escalar serviços de forma independente, com autonomia por área. | Acrescenta comunicação de rede, consistência distribuída, observabilidade e esforço operacional. | Não justificado pelo âmbito atual nem por requisitos de escala, disponibilidade ou autonomia de equipas ainda definidos. |

## 3. Decisão proposta e justificação

Para o MVP, a Matriz deverá ser estruturada como **uma aplicação monolítica com módulos internos bem delimitados**. Os módulos serão organizados por responsabilidades do domínio e comunicarão através de interfaces internas, sem dependências diretas que contornem os seus limites.

Esta opção responde aos requisitos P0 sem introduzir a complexidade de operação distribuída antes de haver uma necessidade comprovada. Ao mesmo tempo, os limites modulares tornam responsabilidades e dependências mais claras e permitem reavaliar a separação de componentes no futuro. A possibilidade de extrair um módulo como serviço independente é uma opção futura, não um objetivo nem uma garantia desta proposta.

## 4. Componentes e responsabilidades

Os componentes seguintes são lógicos e não implicam tecnologias ou processos de execução separados.

| Componente | Responsabilidades |
|---|---|
| Interface da aplicação | Receber ações e pedidos de consulta dos utilizadores, apresentar projetos, tarefas e informação de progresso e encaminhar operações para a camada de aplicação. A tecnologia e o formato da interface permanecem por decidir. |
| Aplicação / casos de uso | Coordenar operações do MVP, como consultar projetos de uma equipa, associar um projeto a uma equipa, consultar e gerir tarefas e obter informação de progresso. Aplica validações e coordena os módulos de domínio sem concentrar as suas regras internas. |
| Módulo de equipas e projetos | Representar as equipas e os projetos e a associação entre ambos; disponibilizar as operações de organização de projetos suportadas pelos requisitos validados. |
| Módulo de tarefas | Representar as tarefas associadas a projetos e disponibilizar operações de consulta e gestão, respeitando as regras de negócio que vierem a ser definidas. |
| Módulo de progresso | Disponibilizar informação sobre o progresso de projetos e tarefas. O cálculo ou mecanismo de atualização depende de uma decisão ainda em aberto e não é fixado nesta proposta. |
| Persistência | Guardar e recuperar os dados necessários aos módulos através de interfaces internas. A tecnologia, o modelo de dados e a estratégia de armazenamento permanecem por decidir. |

## 5. Limites e questões por resolver

- A separação em módulos é uma proposta estrutural; os modelos detalhados e as regras de negócio ainda precisam de validação.
- A autenticação, autorização e definição de permissões não estão especificadas. Esta proposta não escolhe um mecanismo nem presume perfis de utilizador.
- A estrutura dos dados, a tecnologia de persistência e a forma de disponibilização não são definidas aqui.
- O mecanismo de progresso do projeto e os estados das tarefas continuam em aberto.
- Requisitos futuros de escala, disponibilidade, segurança ou autonomia operacional poderão justificar uma revisão da arquitetura; não constituem, por si só, uma decisão de adotar microservices.

## 6. Revisão da decisão

Reavaliar a arquitetura quando os requisitos forem validados e houver evidência de que os limites operacionais, de escala ou de autonomia do monólito modular impedem responder às necessidades do produto. Até lá, manter a solução simples e preservar os limites entre módulos.
