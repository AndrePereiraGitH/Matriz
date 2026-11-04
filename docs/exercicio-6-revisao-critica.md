# Exercício 6 — Revisão Crítica e Human-in-the-Loop

## 1. Objetivo

Rever criticamente a documentação do projeto Matriz, identificando ambiguidades, funcionalidades não justificadas, pressupostos, critérios de aceitação pouco verificáveis, riscos de segurança e inconsistências entre documentos.

A análise foi apoiada por IA, mas as recomendações devem ser avaliadas antes de serem aceites. A IA não substitui a decisão humana.

## 2. Problemas identificados e decisões propostas

| ID | Problema identificado | Recomendação da IA | Decisão proposta |
|---|---|---|---|
| R01 | A utilização da matriz de Eisenhower ainda não foi validada. | Confirmar o conceito antes de iniciar a implementação. | Aceitar |
| R02 | Não está definido onde aparecem as tarefas concluídas. | Definir se permanecem nos quadrantes ou passam para uma secção separada. | Aceitar a necessidade de clarificação; adiar a decisão funcional |
| R03 | A eliminação de tarefas não tem uma política de confirmação ou recuperação definida. | Decidir se é necessária confirmação e se existe recuperação. | Aceitar |
| R04 | O limite máximo dos títulos não está definido. | Definir um limite antes da implementação ou justificar a ausência de limite. | Aceitar a necessidade de clarificação |
| R05 | Alguns requisitos não têm critérios quantitativos ou verificáveis. | Melhorar os critérios de usabilidade, responsividade e compatibilidade. | Aceitar; definir os valores numa fase posterior |
| R06 | Projetos, filtros, calendário e outras funcionalidades podem aumentar a complexidade do MVP. | Manter estas funcionalidades fora do MVP até serem justificadas e aprovadas. | Aceitar |
| R07 | O armazenamento local pode permitir acesso a terceiros com acesso ao mesmo perfil do navegador e não garante cópias de segurança. | Documentar estas limitações e evitar apresentar o sistema como adequado a dados confidenciais. | Aceitar |
| R08 | O comportamento perante dados locais inválidos aparece parcialmente definido e parcialmente pendente. | Manter a regra de não apagar dados silenciosamente e clarificar os restantes comportamentos. | Aceitar |
| R09 | A responsividade não está destacada de forma consistente em todos os documentos. | Uniformizar a descrição do âmbito do MVP. | Aceitar |
| R10 | A implementação ainda não tem tecnologias selecionadas. | Não assumir linguagens, frameworks ou serviços antes de serem aprovados. | Aceitar |

## 3. Funcionalidades não justificadas

A matriz de Eisenhower é a base da proposta atual, mas deve ser confirmada antes de ser tratada como requisito definitivo.

A gestão de projetos, as notificações, a sincronização, a autenticação e as integrações externas não são necessárias para demonstrar o funcionamento básico do MVP, de acordo com o âmbito documentado.

Estas funcionalidades não são rejeitadas definitivamente. Permanecem como possibilidades futuras, sujeitas a validação e aprovação.

## 4. Critérios de aceitação a melhorar

Os critérios relacionados com a apresentação visual das tarefas concluídas, a validade dos títulos, a responsividade e a compatibilidade com navegadores precisam de maior precisão.

A melhoria deve ser feita sem inventar valores arbitrários. Os limites, dimensões de teste e navegadores suportados devem ser definidos quando existir informação suficiente.

## 5. Segurança e privacidade

Os principais riscos identificados são:

- Perda de dados devido à limpeza do armazenamento do navegador.
- Acesso às tarefas por outras pessoas que utilizem o mesmo perfil do navegador.
- Tratamento incorreto de títulos que contenham conteúdo malicioso.
- Falhas de armazenamento apresentadas incorretamente como operações bem-sucedidas.
- Necessidade de rever as medidas de segurança caso sejam introduzidas autenticação, sincronização ou integrações externas.

As restrições de segurança devem ser verificadas durante a implementação e os testes. A sua presença na documentação não comprova que estejam implementadas.

## 6. Consistência entre documentos

A documentação deve manter a mesma distinção entre:

- Funcionalidades essenciais do MVP (P0).
- Funcionalidades previstas para iterações posteriores (P1).
- Funcionalidades futuras (P2).
- Pressupostos ainda não validados.
- Decisões confirmadas pelo responsável pelo projeto.

A regra para não apagar silenciosamente dados locais inválidos deve ser mantida, clarificando-se os restantes procedimentos de recuperação.

A responsividade deve ser descrita de forma consistente no README e nos requisitos.

## 7. Resultado da revisão

A revisão identificou melhorias necessárias, mas não justifica alterar automaticamente todos os documentos ou acrescentar novas funcionalidades.

As alterações devem ser limitadas às decisões aceites. Os restantes pontos devem permanecer registados como questões pendentes.

## 8. Limitações da análise

A análise incidiu sobre a documentação disponível no repositório. Como a implementação da aplicação ainda não está documentada como iniciada, não foi possível verificar o comportamento real do software, executar testes ou confirmar a eficácia das medidas de segurança.

A revisão deverá ser repetida quando os requisitos forem validados e quando existir uma implementação para testar.