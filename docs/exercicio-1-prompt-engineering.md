# Exercício 1 — Prompt Engineering

**Objetivo:** Comparar os resultados obtidos com diferentes níveis de estruturação de um pedido à IA.

## Parte A — Prompt simples

### Prompt utilizado

> Quero criar uma aplicação de gestão de projetos e tarefas chamada Matriz. Ajuda-me a desenvolver a aplicação.

### 1. Que funcionalidades foram sugeridas?

A IA sugeriu as seguintes funcionalidades:

- **Vista de quadro (Kanban):** quadro com colunas como «A fazer», «Em curso» e «Feito».
- **Edição e gestão de projetos e tarefas:** possibilidade de renomear e eliminar projetos, bem como editar tarefas, incluindo descrições, subtarefas e etiquetas.
- **Partilha entre pessoas:** armazenamento dos dados num serviço, permitindo a partilha entre utilizadores, em vez de os dados ficarem apenas no navegador.
- **Calendário ou vista «Hoje e esta semana»:** visualização das tarefas organizadas por data.

### 2. Que decisões foram assumidas pela IA sem confirmação?

A IA tomou várias decisões sem consultar previamente o cliente.

#### 2.1. Sobre o produto

- **Conceito:** interpretou o nome «Matriz» como uma referência à matriz de Eisenhower e escolheu os nomes dos quadrantes: *Fazer já*, *Planear*, *Delegar* e *Adiar ou eliminar*.
- **Âmbito:** decidiu criar uma versão inicial reduzida, com duas vistas principais — Matriz e Lista — sem clarificar primeiro os requisitos.
- **Formato:** optou por uma página Web única, publicada como protótipo, em vez de um projeto de código completo, por exemplo, com React ou Node.js e uma base de dados.
- **Utilizadores:** assumiu que a aplicação seria para uso pessoal, sem contas de utilizador nem trabalho em equipa.
- **Armazenamento:** decidiu guardar os dados no navegador, sem sincronização entre dispositivos.
- **Idioma:** escolheu o português de Portugal sem confirmar esta preferência.

#### 2.2. Sobre as tarefas e os projetos

- Cada tarefa tem apenas título, projeto, quadrante e data-limite opcional, sem descrição, subtarefas, etiquetas ou responsável.
- Os projetos apenas podem ser criados, não sendo possível renomeá-los ou eliminá-los.
- Uma nova tarefa é colocada, por defeito, no quadrante *Fazer já*.
- A eliminação de uma tarefa é imediata, sem pedido de confirmação.
- As tarefas concluídas passam para o final da lista.
- As tarefas atrasadas são apresentadas a vermelho.
- Foram incluídos dados de exemplo: dois projetos e seis tarefas.

#### 2.3. Sobre o aspeto visual

- Escolheu a paleta de cores, o tipo de letra Bricolage Grotesque e o destaque visual do quadrante *Fazer já*.
- O tema claro ou escuro segue as definições do dispositivo, sem disponibilizar um botão para o alterar manualmente.

### 3. A IA propôs uma arquitetura ou tecnologias?

A IA não apresentou formalmente uma arquitetura de software, mas construiu um protótipo e tomou decisões técnicas sem as explicar ou validar previamente com o cliente.

As tecnologias e os mecanismos utilizados foram:

- **Frontend:** uma única página com HTML, CSS e JavaScript puro, sem frameworks como React ou Vue e sem processo de compilação.
- **Gestão do estado:** utilização de um objeto em memória, com a interface a ser redesenhada por inteiro após cada alteração.
- **Persistência de dados:** utilização de `localStorage` do navegador, sem backend, base de dados ou API.
- **Interação:** utilização da API nativa de arrastar e largar (*Drag and Drop*) do HTML5.
- **Tipografia:** utilização do tipo de letra Bricolage Grotesque através do Google Fonts.
- **Alojamento:** publicação da página como artefacto, servindo como protótipo e não como aplicação preparada para produção.

Apesar de não ter definido uma arquitetura formal, a IA escolheu tecnologias e mecanismos de funcionamento sem conhecer os requisitos completos do cliente.

### 4. Que informações deveriam ter sido clarificadas primeiro?

Antes de avançar para o desenvolvimento, a IA deveria ter colocado perguntas para esclarecer os seguintes aspetos:

- **Utilizadores:** quem vai utilizar a aplicação?
- **Significado do nome:** o que significa «Matriz» neste projeto? Refere-se à matriz de Eisenhower ou é apenas o nome da aplicação?
- **Objetivo:** quais são os problemas que a aplicação pretende resolver?
- **Plataforma:** onde será utilizada a aplicação — Web, telemóvel ou ambas?
- **Funcionalidades essenciais:** quais são as funcionalidades prioritárias para a primeira versão?
- **Restrições técnicas:** existem preferências ou limitações relativamente a tecnologias, orçamento ou alojamento?
- **Integrações:** são necessárias ligações a outros serviços, como email, calendários ou ferramentas de gestão de trabalho?
- **Design:** existem preferências visuais ou requisitos de acessibilidade que devam ser respeitados?

### Conclusão

O prompt simples permitiu à IA apresentar sugestões de funcionalidades e construir um protótipo, mas também levou à tomada de várias decisões sem confirmação do cliente.

A IA interpretou o conceito do produto, definiu o âmbito inicial, assumiu um cenário de utilização pessoal e escolheu tecnologias sem esclarecer primeiro os requisitos.

Este resultado demonstra a importância de identificar ambiguidades, distinguir pressupostos de factos conhecidos e clarificar as necessidades do cliente antes de definir a solução a desenvolver.

## Parte B — Prompt estruturado

## 1. Os dois prompts em resumo

| Dimensão | Prompt 1 (aberto) | Prompt 2 (estruturado) |
|---|---|---|
| **Pedido** | "Ajuda-me a desenvolver a aplicação" | Analisar requisitos, sem implementar |
| **Papel** | Não definido | Analista de requisitos |
| **Contexto** | Quase nenhum (só o nome e o tipo de app) | Empresa, equipas, citação do cliente, referências de mercado |
| **Restrições** | Nenhuma | Sem tecnologia, sem código, sem decisões de âmbito |
| **Resultado esperado** | Implícito | Estruturado, por temas, com perguntas e justificações |
| **Validação** | Nenhuma | Lista de verificação antes de responder |

## 2. O que aconteceu na prática?

### Prompt 1 — Prompt simples

O pedido era ambíguo e resolvi essa ambiguidade sozinho: construí um protótipo, assumi que «Matriz» se referia à matriz de Eisenhower, que a aplicação seria para uso pessoal e que os dados ficariam armazenados no navegador.

O resultado foi funcional, mas assentava em pressupostos que só foram explicitados posteriormente, quando me foram colocadas perguntas sobre as decisões tomadas.

Foi uma abordagem rápida e produziu um resultado concreto, mas com um risco elevado de estar a resolver o problema errado.

### Prompt 2 — Prompt estruturado

O comportamento esperado ficou definido desde o início: colocar perguntas antes de tomar decisões, separar factos de pressupostos e não avançar para soluções técnicas ou implementação.

A resposta tornou-se mais previsível, estruturada e fácil de avaliar, uma vez que os objetivos, as restrições e os critérios de validação estavam explicitamente definidos.

## 3. Vantagens de um prompt estruturado

- **Reduz a ambiguidade:** o objetivo e os limites estão definidos, reduzindo a margem para interpretações livres.
- **Controla o âmbito:** as restrições impedem que a IA avance diretamente para a implementação, como aconteceu com o primeiro prompt.
- **Torna a resposta verificável:** a existência de critérios de validação explícitos permite avaliar o resultado ponto por ponto, verificando, por exemplo, se foram propostas tecnologias.
- **Define o papel e o nível de rigor:** solicitar uma análise de requisitos orienta a abordagem, o raciocínio e o vocabulário utilizados pela IA.
- **Facilita a comparação e a repetição:** uma estrutura estável permite comparar os resultados de diferentes execuções ou modelos.
- **Proporciona uma resposta previsível:** uma organização consistente facilita a leitura e a reutilização da documentação.
- **Torna os pressupostos visíveis:** a distinção entre factos, hipóteses e lacunas evita que decisões importantes permaneçam implícitas, como aconteceu com o primeiro prompt.
- **Alinha a resposta com a fase do projeto:** orienta a IA para a atividade necessária naquela fase — clarificar os requisitos — em vez de avançar prematuramente para a construção da aplicação.

## 4. Limitações e críticas à abordagem estruturada

Apesar das vantagens, a comparação não é inteiramente justa e o segundo prompt também apresenta algumas fragilidades.

### 4.1. Comparação não isolada

O segundo prompt forneceu mais informação, incluindo referências a empresas e ferramentas como Jira, Azure DevOps e Trello. Parte da melhoria obtida pode resultar do contexto adicional e não apenas da estrutura do prompt.

### 4.2. Tensão interna no contexto

O prompt pede que não sejam assumidos requisitos sem confirmação, mas inclui referências a ferramentas que não foram mencionadas pelo cliente. Estas referências devem ser tratadas como exemplos de enquadramento, e não como requisitos ou preferências confirmados.

### 4.3. Excesso de perguntas

Embora o prompt peça para evitar redundâncias e dar prioridade às questões mais importantes, a organização por vários temas pode originar dezenas de perguntas.

Num contexto real, um número excessivo de perguntas pode sobrecarregar o cliente. Seria preferível começar pelas questões com maior impacto no âmbito do produto e esclarecer os restantes detalhes progressivamente.

### 4.4. Proibição de protótipos

A restrição de não construir protótipos evita decisões prematuras, mas um protótipo simples também pode ajudar a esclarecer requisitos. Mostrar uma solução visual concreta pode facilitar a compreensão das necessidades e preferências do cliente.

Por isso, a abordagem «primeiro perguntar, depois construir» nem sempre é a mais eficiente. A escolha depende do contexto e do custo de desenvolver e alterar o protótipo.

### 4.5. Validação autodeclarada

Pedir à própria IA que verifique o seu trabalho pode ajudar a identificar falhas, mas não garante que a resposta esteja correta ou completa. Continua a ser necessária uma revisão humana independente.

### 4.6. Rigidez e custo

A elaboração de um prompt estruturado exige mais tempo e algum conhecimento do processo de análise de requisitos. Para tarefas simples ou exploração inicial de ideias, este nível de detalhe pode ser excessivo.

### 4.7. Risco de falsa segurança

Uma resposta bem organizada pode transmitir uma sensação de completude, mesmo quando existem requisitos importantes por esclarecer. A qualidade da estrutura não garante que todas as perguntas relevantes tenham sido identificadas.

## 5. Quando utilizar cada abordagem?

### Prompt aberto

É mais adequado para:

- Exploração inicial de ideias.
- Brainstorming e sugestões criativas.
- Criação de protótipos descartáveis.
- Situações em que o custo de uma interpretação incorreta é reduzido.

### Prompt estruturado

É mais adequado para:

- Decisões com impacto significativo no projeto.
- Trabalho que será reutilizado, documentado ou revisto por outras pessoas.
- Tarefas que exigem critérios de qualidade verificáveis.
- Fases em que a sequência de atividades é importante, como a análise e especificação de requisitos.

### Combinação das duas abordagens

Uma estratégia equilibrada consiste em começar com um prompt estruturado para clarificar os requisitos e identificar as principais incertezas. Depois, pode ser solicitado um protótipo para recolher feedback e validar as hipóteses identificadas.

Também é possível utilizar um protótipo inicial como instrumento de clarificação, desde que as suas funcionalidades e decisões sejam explicitamente identificadas como hipóteses por validar.

## 6. Conclusão - comparação crítica entre abordagens

A principal vantagem do segundo prompt não está apenas na sua formatação, mas nas decisões que explicita: o papel da IA, os limites da tarefa, os critérios de qualidade e as ações que não devem ser realizadas.

O primeiro prompt deu liberdade à IA, que a utilizou para tomar decisões em nome do cliente. O segundo tornou essas decisões mais visíveis e orientou a IA para devolver as questões em aberto a quem deve tomar as decisões: o cliente e a equipa responsável pelo projeto.

No entanto, uma estrutura mais rigorosa não garante, por si só, a qualidade do resultado. A eficácia de um prompt estruturado depende da qualidade e fidelidade do contexto fornecido, da adequação das restrições e da validação crítica das respostas obtidas.