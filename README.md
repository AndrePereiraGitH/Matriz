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

O âmbito funcional consolidado está em [docs/requirements.md](docs/requirements.md). A matriz de permissões e alguns detalhes de dados/sessão continuam pendentes de validação antes da implementação das operações protegidas.

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
| `docs/exercicio-1-prompt-engineering.md` | Registo do Exercício 1 |
| `docs/exercicio-2-análise-de-requisitos-com-AI.md` | Registo do Exercício 2 |
| `docs/exercicio-3-User-Stories-and-Acceptance-Criteria.md` | Registo do Exercício 3 |
| `docs/exercicio-6-revisao-critica.md` | Revisão crítica da especificação |

## 5. Estado atual

O âmbito da Ficha 03 e o plano de implementação estão documentados. A arquitetura monólito modular e a stack TypeScript, React/Vite, Node.js/Express e SQLite/Prisma foram escolhidas para o plano.

A aplicação executável tem um workspace React/Vite em `apps/web` e um workspace Express/TypeScript em `apps/api`. O backend tem schema Prisma/SQLite, migrations aplicadas, ligação validada à base local e seed de demonstração. As rotas e funcionalidades de negócio continuam por implementar.

A implementação de operações protegidas aguarda validação do formador sobre a matriz de autorização, elegibilidade de responsáveis e política de eliminação. O protocolo de sessão continua uma proposta.

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

A API carrega `PORT` e `DATABASE_URL` a partir de `apps/api/.env`. O exemplo usa uma base SQLite local fictícia (`file:../dev.db`, resolvida como `apps/api/dev.db`); não contém credenciais. O ficheiro `.env` local e os ficheiros de base de dados são ignorados pelo Git. O servidor só começa a escutar depois de estabelecer ligação à base de dados.

Para verificar o estado das migrations e testar o arranque/API, numa segunda janela de terminal:

```sh
npm run db:status -w @matriz/api
npm run dev -w @matriz/api
curl -i http://127.0.0.1:3000/
```

O arranque deve imprimir `Matriz API listening on port 3000`, o que só acontece após a ligação Prisma. Até serem adicionadas rotas, o `curl` à raiz responde `404` — é esperado e confirma que o servidor HTTP está acessível. Os testes `npm test` executam também migrations numa base temporária e verificam operações de leitura/escrita através do Prisma.

O schema Prisma está em `apps/api/prisma/schema.prisma`; as migrations versionadas ficam em `apps/api/prisma/migrations/`. Para gerar o cliente e aplicar migrations em desenvolvimento:

```sh
npm run db:generate -w @matriz/api
npm run db:migrate -w @matriz/api
```

Para aplicar migrations existentes noutro ambiente, use `npm run db:deploy -w @matriz/api`.

A seed de demonstração é manual e não é executada no arranque. Define `DEMO_USER_A_PASSWORD` e `DEMO_USER_B_PASSWORD` em `apps/api/.env` antes de executar `npm run db:seed -w @matriz/api`; cada valor deve ter pelo menos 12 caracteres. O `.env.example` contém apenas palavras-passe fictícias para desenvolvimento local — substitui-as fora deste ambiente. A seed cria `ana.demo@example.test` e `bruno.demo@example.test`, cada um numa equipa e projeto separados, com uma tarefa de exemplo. As palavras-passe são armazenadas com scrypt; repetir a seed não apaga registos nem altera os dados existentes das contas demo.

## 7. Princípios de trabalho

- Não assumir funcionalidades que não tenham sido justificadas pelos requisitos.
- Distinguir requisitos confirmados de pressupostos e questões em aberto.
- Manter a documentação consistente entre os diferentes ficheiros.
- Implementar por incrementos e verificar os critérios definidos no plano.
- Não presumir papéis, permissões ou regras de negócio que aguardam validação.