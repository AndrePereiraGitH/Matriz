# Exercício 6 — Revisão Crítica da Especificação

## 1. Objetivo

O objetivo deste exercício é rever criticamente a documentação produzida para a Matriz, identificando ambiguidades, pressupostos não confirmados, inconsistências e possíveis riscos.

A revisão procura garantir que a especificação corresponde às necessidades apresentadas pelo cliente e que pode servir de base para as fases seguintes do projeto.

## 2. Problema identificado: interpretação incorreta do âmbito

Durante a revisão da documentação, foi identificada uma diferença importante entre a interpretação inicial do projeto e o enquadramento original fornecido pelo cliente.

A documentação inicial descrevia a Matriz como uma aplicação individual de gestão de tarefas baseada na matriz de Eisenhower.

No entanto, o enunciado original define a Matriz como:

> Uma aplicação destinada à gestão de projetos e tarefas de equipas de trabalho.

O cliente pretende que as equipas possam organizar projetos, gerir tarefas e acompanhar o progresso do trabalho.

### Problema

A interpretação inicial introduziu funcionalidades e decisões que não estavam presentes no enunciado, nomeadamente:

- Utilização individual da aplicação;
- Organização de tarefas através da matriz de Eisenhower;
- Armazenamento local no navegador;
- Ausência de contas de utilizador;
- Ausência de colaboração entre membros de equipas.

Estas decisões alteraram significativamente o âmbito do projeto.

### Correção

A especificação foi revista para representar uma aplicação de gestão de projetos e tarefas para equipas de trabalho.

As funcionalidades e decisões técnicas que não foram confirmadas passaram a ser identificadas como questões em aberto.

## 3. Outros problemas identificados

| ID | Problema identificado | Correção proposta |
|---|---|---|
| R01 | A aplicação foi inicialmente interpretada como uma ferramenta individual. | Corrigir o âmbito para gestão de trabalho em equipa. |
| R02 | A matriz de Eisenhower foi introduzida sem indicação do cliente. | Remover essa funcionalidade da especificação principal. |
| R03 | O armazenamento local foi assumido como decisão técnica. | Deixar a tecnologia e persistência em aberto. |
| R04 | A ausência de autenticação foi assumida sem justificação. | Identificar autenticação e gestão de utilizadores como questões a esclarecer. |
| R05 | As funcionalidades de colaboração não estavam devidamente representadas. | Considerar as necessidades relacionadas com equipas e projetos na especificação. |
| R06 | Algumas funcionalidades adicionais foram propostas sem validação. | Distinguir funcionalidades confirmadas de possíveis funcionalidades futuras. |
| R07 | Alguns requisitos não funcionais foram apresentados como decisões definitivas. | Transformá-los em dimensões a analisar e validar. |
| R08 | Os critérios de aceitação não definiam sempre comportamentos suficientemente verificáveis. | Tornar os critérios mais objetivos e identificar as decisões ainda necessárias. |

## 4. Pressupostos e decisões não justificadas

A revisão identificou vários exemplos de pressupostos que não deveriam ter sido tratados como factos:

- A aplicação seria utilizada por uma única pessoa.
- As tarefas seriam organizadas por urgência e importância.
- Os dados seriam guardados no armazenamento local do navegador.
- Não existiriam contas ou autenticação.
- Não existiria colaboração entre utilizadores.
- A aplicação seria obrigatoriamente desenvolvida com determinadas tecnologias.

Estes pressupostos foram removidos da especificação principal ou identificados como decisões por tomar.

## 5. Revisão dos critérios de aceitação

Os critérios de aceitação devem permitir verificar objetivamente se uma funcionalidade cumpre o comportamento esperado.

Por exemplo, um critério genérico como:

"Deve ser possível acompanhar facilmente o progresso do projeto."

não é suficientemente verificável, porque a expressão "facilmente" é subjetiva.

Uma formulação mais objetiva seria:

"Quando um utilizador consulta um projeto, o sistema apresenta informação sobre o progresso desse projeto."

Ainda será necessário definir como o progresso é calculado ou representado.

Esta distinção permite criar critérios verificáveis sem inventar regras de negócio que o cliente ainda não confirmou.

## 6. Segurança e privacidade

A aplicação poderá armazenar informação relativa a equipas, projetos, tarefas e utilizadores.

Por isso, deverão ser analisados os seguintes aspetos:

- Quem pode consultar os projetos e as respetivas tarefas?
- Quem pode criar, editar ou eliminar informação?
- Como são protegidos os dados dos utilizadores?
- Como são geridas as permissões entre equipas?
- É necessário manter um histórico de alterações?

As respostas a estas questões deverão ser incorporadas nos requisitos antes da implementação.

## 7. Consistência entre documentos

Após a revisão, os documentos principais foram alinhados com o âmbito original do projeto:

- `README.md`: apresenta a Matriz como uma aplicação de gestão de projetos e tarefas para equipas.
- `requirements.md`: identifica os requisitos funcionais principais e as questões por esclarecer.
- `user-stories.md`: apresenta histórias relacionadas com projetos, equipas, tarefas e progresso.
- `constraints.md`: distingue as restrições conhecidas das decisões técnicas ainda não tomadas.

O `AGENTS.md` mantém-se como documento de orientação para ferramentas de IA, uma vez que as suas regras gerais continuam adequadas.

## 8. Resultado da revisão

A revisão permitiu identificar e corrigir um problema fundamental na interpretação inicial do projeto.

A especificação atual está alinhada com o objetivo apresentado pelo cliente: desenvolver uma aplicação para ajudar equipas de trabalho a organizar projetos, gerir tarefas e acompanhar o progresso.

Apesar desta correção, existem ainda questões funcionais e técnicas por esclarecer.

Essas questões deverão ser analisadas e validadas antes de avançar para decisões detalhadas de arquitetura e implementação.

## 9. Conclusão

A utilização de ferramentas de IA permitiu acelerar a elaboração da documentação, mas também demonstrou a importância da revisão crítica das respostas geradas.

Uma resposta da IA pode parecer coerente e completa, mas introduzir pressupostos que alteram o objetivo real do projeto.

Por isso, é essencial comparar a documentação produzida com o enunciado original, questionar as decisões não justificadas e validar os requisitos antes de avançar para as fases seguintes.