# Matriz

## 1. Enquadramento do projeto

A Matriz é uma aplicação destinada à gestão de projetos e tarefas de equipas de trabalho.

O objetivo é permitir que as equipas organizem os seus projetos, façam a gestão das tarefas associadas e acompanhem o progresso do trabalho.

A aplicação pretende responder à seguinte necessidade identificada pelo cliente:

> "Precisamos de uma aplicação onde as nossas equipas possam organizar projetos, gerir tarefas e acompanhar o progresso do trabalho."

A solução inspira-se em ferramentas de gestão de trabalho como Jira, Azure DevOps e Trello, sem assumir que terá necessariamente as mesmas funcionalidades.

## 2. Objetivo do projeto

O objetivo é implementar incrementalmente o MVP da Matriz com apoio de AI Assistants/Coding Agents, aplicando as decisões documentadas e verificando cada incremento. O plano está em [docs/implementation-plan.md](docs/implementation-plan.md); o scaffold, a persistência inicial e os dados de demonstração já estão preparados.

## 3. Âmbito inicial

A especificação deverá considerar os seguintes conceitos principais:

- Equipas de trabalho;
- Projetos;
- Tarefas;
- Organização das tarefas;
- Acompanhamento do progresso dos projetos e tarefas.

O âmbito funcional consolidado está em [docs/requirements.md](docs/requirements.md). A autorização para projetos, tarefas, comentários e atribuições segue a política documentada: acesso de membros da equipa, com gestão do projeto reservada ao seu proprietário.

## 4. Documentação

| Ficheiro | Descrição |
|---|---|
| `docs/requirements.md` | Requisitos funcionais e não funcionais, âmbito e questões em aberto |
| `docs/user-stories.md` | Histórias de utilizador e critérios de aceitação |
| `docs/constraints.md` | Restrições, pressupostos e decisões ainda não confirmadas |
| `docs/architecture.md` | Arquitetura modular e stack aprovada para o plano |
| `docs/database.md` | Modelo de dados conceptual e diagrama ER |
| `openapi.yaml` | Contrato REST do MVP |
| `docs/ui/wireframe-dashboard.svg` | Wireframe do painel |
| `docs/architecture-pack.md` | Revisão cruzada do Architecture Pack |
| `docs/implementation-plan.md` | Incrementos, critérios de aceitação, verificações e estado |
| `docs/verification.md` | Resultados e evidências da verificação do MVP (Exercício 8) |
| `docs/exercicio-1-prompt-engineering.md` | Registo do Exercício 1 |
| `docs/exercicio-2-análise-de-requisitos-com-AI.md` | Registo do Exercício 2 |
| `docs/exercicio-3-User-Stories-and-Acceptance-Criteria.md` | Registo do Exercício 3 |
| `docs/exercicio-6-revisao-critica.md` | Revisão crítica da especificação |

## 5. Estado atual

O âmbito da Ficha 03 e o plano de implementação estão documentados. A arquitetura monólito modular e a stack TypeScript, React/Vite, Node.js/Express e SQLite/Prisma foram escolhidas para o plano.

A aplicação executável tem um workspace React/Vite em `apps/web` e um workspace Express/TypeScript em `apps/api`. O backend tem schema Prisma/SQLite, migrations versionadas, ligação validada à base local e seed de demonstração. Login, perfil, logout e operações API protegidas de projetos, tarefas, comentários e atribuições estão implementados. A interface permite gerir projetos e tarefas no detalhe de cada projeto, incluindo a associação de responsáveis elegíveis e a consulta/criação de comentários com autor e data. O conteúdo de comentários é validado entre 1 e 2000 caracteres e não pode conter apenas espaços.

A API de projetos, tarefas, comentários e atribuições aplica autorização por pertença à equipa e proprietário do projeto. A eliminação é recusada se um projeto tiver tarefas ou se uma tarefa tiver comentários ou atribuições; as chaves estrangeiras restritivas preservam os registos dependentes e evitam órfãos. A interface de projetos pede confirmação antes de eliminar e explica a recusa. O mecanismo de sessão por cookie HTTP-only identifica o utilizador; as regras de autorização são verificadas separadamente em cada pedido.

Na interface autenticada, os projetos podem ser pesquisados por nome, consultados e, para o respetivo proprietário, criados, editados e eliminados. A listagem apresenta contagens por estado para cada projeto; estas contagens e as listas são atualizadas após as operações sem recarregar a página. A eliminação pede confirmação e apresenta a razão quando o backend recusa um projeto com tarefas associadas. Os testes automatizados verificam o ciclo CRUD da API numa base temporária; o estado detalhado dos incrementos está em [docs/implementation-plan.md](docs/implementation-plan.md).

No detalhe de cada projeto acessível, a interface permite criar, listar, consultar, editar e eliminar tarefas com título, descrição, estado e prioridade. A edição permite alterar o estado e a prioridade; a listagem pode ser filtrada por qualquer um destes campos ou por ambos. A eliminação pede confirmação e explica a recusa quando existem comentários ou responsáveis associados. O contrato não define paginação para a listagem de tarefas.

A API valida os dados de projetos e tarefas antes de os guardar, rejeita nomes de projetos e títulos de tarefas compostos apenas por espaços e devolve erros identificando o campo inválido; a interface apresenta essas mensagens.

As tarefas têm título obrigatório entre 3 e 150 caracteres, descrição opcional até 2000 caracteres, estado inicial `TODO` e prioridade inicial `MEDIUM`. A interface apresenta os estados e prioridades em português e a API mantém os respetivos valores técnicos.

No detalhe da tarefa, a interface permite consultar os responsáveis atuais, associar vários membros elegíveis da equipa e remover cada atribuição individualmente. O Backend confirma a existência do utilizador e a pertença à equipa do projeto; repetir uma associação é idempotente e não cria duplicados. A interface obtém a lista de elegíveis e os responsáveis atuais da API e atualiza os dados após cada alteração.

## 6. Desenvolvimento local

Requer Node.js 22.12 ou superior e npm.

```sh
npm ci
test -e apps/api/.env || cp apps/api/.env.example apps/api/.env
npm run db:migrate -w @matriz/api
npm run db:seed -w @matriz/api
npm run dev
```

O comando de desenvolvimento inicia a interface Vite em `http://localhost:5173` e a API Express em `http://localhost:3000` (ou na porta definida pela variável `PORT`), ligada apenas a `127.0.0.1`. Também estão disponíveis:

```sh
npm run build
npm run typecheck
npm test
npm run lint
```

O runner de testes escolhido é Vitest.

A API carrega `PORT`, `DATABASE_URL` e `WEB_ORIGIN` a partir de `apps/api/.env`; a seed também lê as palavras-passe demo desse ficheiro. O exemplo usa uma base SQLite local (`file:../dev.db`, resolvida como `apps/api/dev.db`) e valores fictícios, não credenciais reais. O ficheiro `.env` local e os ficheiros de base de dados são ignorados pelo Git. O servidor só começa a escutar depois de estabelecer ligação à base de dados.

Para verificar o estado das migrations e testar o arranque/API, numa segunda janela de terminal:

```sh
npm run db:status -w @matriz/api
npm run dev -w @matriz/api
curl -i http://127.0.0.1:3000/
```

O arranque deve imprimir `Matriz API listening on port 3000`, o que só acontece após a ligação Prisma. A API expõe autenticação sob `/api/v1/auth` e projetos, tarefas, comentários e atribuições sob `/api/v1`; o `curl` à raiz continua a responder `404`, pois não existe uma rota na raiz. Os testes `npm test` executam migrations numa base temporária e verificam autenticação, autorização e operações de leitura/escrita.

O schema Prisma está em `apps/api/prisma/schema.prisma`; as migrations versionadas ficam em `apps/api/prisma/migrations/`. Para gerar o cliente e aplicar migrations em desenvolvimento:

```sh
npm run db:generate -w @matriz/api
npm run db:migrate -w @matriz/api
```

Para aplicar migrations existentes noutro ambiente, use `npm run db:deploy -w @matriz/api`.

A migration `20261115151000_add_project_owner` adiciona o proprietário aos projetos sem resetar nem reescrever os projetos existentes. Projetos legados mantêm `owner_id` nulo porque o seu criador não pode ser inferido com segurança; projetos criados pela API registam sempre o utilizador autenticado.

A seed de demonstração é manual e não é executada no arranque. Define `DEMO_USER_A_PASSWORD` e `DEMO_USER_B_PASSWORD` em `apps/api/.env` antes de executar `npm run db:seed -w @matriz/api`; cada valor deve ter pelo menos 12 caracteres. O `.env.example` contém apenas palavras-passe fictícias para desenvolvimento local — substitui-as fora deste ambiente. A seed cria `ana.demo@example.test` e `bruno.demo@example.test`, cada um numa equipa e projeto separados, com uma tarefa de exemplo. As palavras-passe são armazenadas com scrypt; repetir a seed não apaga dados e associa o proprietário previsto aos projetos demo sem alterar os restantes campos.

Contas fictícias disponibilizadas pela seed:

| Utilizador | Email | Equipa | Palavra-passe local |
|---|---|---|---|
| Ana Demonstração | `ana.demo@example.test` | Equipa de Demonstração A | Valor de `DEMO_USER_A_PASSWORD` em `apps/api/.env` |
| Bruno Demonstração | `bruno.demo@example.test` | Equipa de Demonstração B | Valor de `DEMO_USER_B_PASSWORD` em `apps/api/.env` |

Os valores de exemplo do `.env.example` destinam-se exclusivamente a uma instalação local fictícia. Defina palavras-passe próprias com pelo menos 12 caracteres em qualquer ambiente partilhado; nunca publique `.env`.

### Autenticação local

A aplicação usa sessões opacas persistidas no SQLite. O servidor guarda apenas o hash SHA-256 do token de sessão; o token é enviado numa cookie `matriz_session` HTTP-only, `SameSite=Lax`, com validade absoluta de oito horas e `Secure` em produção. O frontend envia a cookie nas chamadas à API. Depois do login, `GET /api/v1/auth/me` devolve o perfil e um token CSRF novo; pedidos autenticados de escrita devem enviar esse token no cabeçalho `X-CSRF-Token`. Consultar novamente o perfil substitui o token CSRF anterior. `POST /api/v1/auth/logout` valida o token e invalida a sessão no servidor.

Os endpoints disponíveis são `POST /api/v1/auth/login`, `GET /api/v1/auth/me` e `POST /api/v1/auth/logout`. A interface verifica a sessão ao abrir, permite iniciar/terminar sessão e volta ao formulário de login com uma mensagem compreensível quando a sessão expira ou deixa de ser válida. O valor `WEB_ORIGIN` em `apps/api/.env` deve corresponder à origem do frontend; em desenvolvimento, o exemplo usa `http://localhost:5173`.

O frontend usa por omissão `http://localhost:3000/api/v1` como endereço da API. Para apontar para outro Backend em desenvolvimento, defina `VITE_API_URL` (por exemplo, em `apps/web/.env.local`) com a URL base terminada em `/api/v1`; alinhe `WEB_ORIGIN` no Backend com a origem do frontend.

Para validar a autenticação e a aplicação:

```sh
npm test
npm run typecheck
npm run build
```

O contrato de sessão e as respostas estão descritos em [openapi.yaml](openapi.yaml). A sessão autentica a identidade; cada rota aplica separadamente a política de autorização de recursos.

### Autorização da API

Todas as rotas de projetos, tarefas, comentários e atribuições exigem uma sessão válida. Apenas membros da equipa do projeto podem consultar os seus recursos ou gerir tarefas, comentários e atribuições. Apenas o proprietário — definido pelo backend a partir da sessão no momento da criação — pode editar ou eliminar o projeto. A API rejeita `ownerId` e `authorId` enviados como campos de pedido e verifica autorização em cada endpoint, não apenas na interface. As duas contas demo pertencem a equipas separadas para testar isolamento entre utilizadores.

## 7. Princípios de trabalho

- Não assumir funcionalidades que não tenham sido justificadas pelos requisitos.
- Distinguir requisitos confirmados de pressupostos e questões em aberto.
- Manter a documentação consistente entre os diferentes ficheiros.
- Implementar por incrementos e verificar os critérios definidos no plano.
- Não presumir papéis, permissões ou regras de negócio que aguardam validação.