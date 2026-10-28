# Matriz — Constraints and Decisions

## 1. Restrições conhecidas

- O projeto encontra-se inicialmente na fase de análise de requisitos e documentação.
- O MVP destina-se a utilização individual.
- A aplicação deverá ser acessível através de um navegador.
- O armazenamento inicial será local no navegador.
- A colaboração e a sincronização entre dispositivos estão fora do MVP.
- A solução deverá evitar funcionalidades desnecessárias antes de validar os requisitos essenciais.
- A interface proposta será em português de Portugal.

## 2. Pressupostos assumidos

Os seguintes pontos são pressupostos de trabalho e não requisitos confirmados pelo cliente:

1. «Matriz» refere-se à matriz de Eisenhower.
2. O utilizador principal é uma pessoa que organiza as suas próprias tarefas.
3. A matriz contém quatro quadrantes definidos por urgência e importância.
4. Uma tarefa tem título, urgência, importância e estado de conclusão.
5. O armazenamento local é suficiente para a primeira versão.
6. Não são necessárias contas de utilizador nem serviços externos no MVP.
7. A interface deve adaptar-se a diferentes tamanhos de ecrã.

Estes pressupostos devem ser revistos quando existir informação adicional.

## 3. Segurança e privacidade

### 3.1. Armazenamento local

- As tarefas do MVP deverão ser guardadas localmente no navegador.
- A aplicação não deverá transmitir os dados das tarefas para um servidor externo.
- O utilizador deverá ser informado de que os dados podem deixar de estar disponíveis se limpar os dados do navegador ou utilizar outro dispositivo ou ambiente de armazenamento.
- A aplicação não deverá afirmar que os dados foram guardados quando a operação falhou.

### 3.2. Minimização de dados

- A aplicação deverá recolher apenas os dados necessários à gestão das tarefas.
- Não serão necessários dados pessoais para identificar o utilizador no MVP.
- Não deverão ser introduzidos mecanismos de recolha de dados ou de análise externa sem uma decisão explícita.

### 3.3. Segurança da interface

- Os títulos das tarefas deverão ser apresentados como texto, sem executar conteúdo introduzido pelo utilizador como código HTML ou JavaScript.
- Os dados recuperados do armazenamento local deverão ser validados antes de serem utilizados.
- Erros de leitura ou escrita deverão ser tratados sem falhas silenciosas.
- A aplicação deverá evitar a perda involuntária de dados.

### 3.4. Limitações de segurança

O armazenamento local não constitui uma solução de cópia de segurança nem protege os dados contra qualquer pessoa que tenha acesso ao mesmo perfil de navegador.

Como não existe autenticação no MVP, a aplicação não deverá ser apresentada como um sistema de gestão de dados confidenciais ou com controlo de acesso individual.

## 4. Decisões técnicas ainda pendentes

| Tema | Decisão atual | Estado |
|---|---|---|
| Plataforma | Aplicação web | Pressuposto |
| Linguagens e tecnologias | Ainda não definidas | Pendente |
| Framework frontend | Ainda não definido | Pendente |
| Arquitetura da aplicação | Ainda não definida | Pendente |
| Persistência | Armazenamento local no navegador | Proposta para o MVP |
| Backend | Não previsto no MVP inicial | Pressuposto |
| Base de dados remota | Não prevista no MVP inicial | Pressuposto |
| Testes automatizados | Ferramentas e estratégia por definir | Pendente |
| Navegadores suportados | Por definir | Pendente |
| Acessibilidade | Critérios específicos por definir | Pendente |
| Alojamento e publicação | Por definir | Pendente |
| Gestão de dependências e segurança | Ferramentas e processo por definir | Pendente |

Nenhuma tecnologia específica deverá ser tratada como obrigatória até ser escolhida e documentada.

## 5. Limitações de âmbito

Não fazem parte do MVP:

- Autenticação e gestão de contas.
- Partilha de tarefas ou projetos.
- Atribuição de tarefas a outros utilizadores.
- Sincronização entre dispositivos.
- Notificações automáticas.
- Integrações externas.
- Relatórios avançados.
- Gestão de projetos, pesquisa, filtros e vistas alternativas, salvo alteração explícita do âmbito.

Qualquer nova funcionalidade deverá ser avaliada quanto ao seu valor, complexidade e impacto no MVP antes de ser incluída.

## 6. Regras para a utilização de IA no desenvolvimento

A IA deverá utilizar estes documentos como contexto de referência.

Durante o desenvolvimento, deverá:

1. Respeitar os requisitos e o âmbito definidos.
2. Distinguir requisitos confirmados de pressupostos e propostas.
3. Não introduzir tecnologias, serviços ou funcionalidades como se tivessem sido aprovados quando ainda estão pendentes.
4. Identificar contradições entre os documentos antes de propor alterações.
5. Pedir esclarecimentos quando uma decisão em falta afetar significativamente a implementação.
6. Propor alterações aos documentos quando os requisitos mudarem.
7. Explicar as alterações realizadas e os testes necessários para as validar.
8. Evitar alterações não relacionadas com a tarefa solicitada.

## 7. Revisão das decisões

Sempre que uma decisão pendente for tomada, os documentos relevantes deverão ser atualizados em conjunto para manter a consistência entre requisitos, User Stories, restrições e README.