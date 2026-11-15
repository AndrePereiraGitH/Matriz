# Matriz — Plano de Implementação da Ficha 03

## 1. Objetivo e estado

Plano incremental para implementar o MVP documentado em [requirements.md](./requirements.md), usando a stack registada em [architecture.md](./architecture.md). O scaffold e a persistência inicial estão configurados; as funcionalidades de domínio e a autenticação continuam por implementar.

Estado global: **Incrementos 1 e 2 concluídos: aplicação executável, schema/migrations e seed preparados e verificados. Funcionalidades protegidas continuam bloqueadas até validação das regras de autorização com o formador.**

## 2. Decisões consolidadas

- Arquitetura: monólito modular.
- Stack planeada: TypeScript, React/Vite, Node.js/Express e SQLite/Prisma.
- Cada projeto pertence a uma equipa.
- Estados de tarefa: `TODO`, `IN_PROGRESS`, `DONE`.
- Prioridades: `LOW`, `MEDIUM`, `HIGH`.
- Contas de demonstração são criadas por seed; registo público e recuperação de palavra-passe ficam fora do MVP.
- O painel apresenta contagens por estado calculadas a partir das tarefas.

## 3. Bloqueios antes da implementação de funcionalidades protegidas

Obter validação do formador e atualizar [constraints.md](./constraints.md), [database.md](./database.md) e [openapi.yaml](../openapi.yaml) com:

1. Matriz de permissões para consultar/gerir projetos, tarefas, comentários e atribuições.
2. Critério de elegibilidade para responsáveis (por exemplo, membros da equipa do projeto).
3. Possibilidade de um utilizador pertencer a várias equipas, quem pode escolher uma equipa ao criar projeto e se um projeto pode ser transferido para outra equipa.
4. Protocolo de sessão/autenticação e mitigação CSRF; a cookie session em `openapi.yaml` é uma proposta, não uma decisão validada.
5. Se o painel apresenta contagens por estado globalmente ou por projeto (o wireframe atual propõe por projeto).
6. Política de eliminação de projetos/tarefas com dados dependentes.

As operações protegidas não devem ser disponibilizadas como públicas nem implementar papéis presumidos enquanto esta validação não existir.

## 4. Incrementos e critérios de aceitação

O incremento 1 foi concluído para a estrutura e os scripts iniciais. Os restantes incrementos continuam por iniciar ou bloqueados conforme indicado.

| # | Incremento / componentes previstos | Dependências | Critérios de aceitação | Verificação |
|---|---|---|---|---|
| 0 | Resolver decisões de acesso e sessão; rever documentos de requisitos, dados e API. | Resposta do formador. | Permissões por operação, elegibilidade, pertença a equipa, transferência de projeto, protocolo de sessão, agrupamento das contagens do painel e política de eliminação documentados e coerentes. | Revisão humana dos documentos e validação cruzada dos endpoints protegidos. **Estado: Bloqueado.** |
| 1 | Criar estrutura do repositório, scripts e aplicações TypeScript para interface e API. | Stack aprovada; o scaffold sem funcionalidades protegidas pode avançar enquanto o incremento 0 está bloqueado. | Aplicações arrancam localmente; configuração não contém segredos; verificações de tipos e build executam por scripts documentados. | `npm ci`, type-check, build, teste de arranque local e runner Vitest configurado. **Estado: Concluído para o scaffold; sem rotas de negócio ou persistência.** |
| 2 | Configurar variáveis de ambiente e Prisma/SQLite; criar esquema, migrações e seed de utilizadores de demonstração, equipas e dados relacionais mínimos. | Incremento 1; regras de pertença/elegibilidade para seed de associação. | Configuração local não expõe credenciais reais; migração cria o esquema; seed manual é repetível sem apagar dados; passwords são guardadas como hashes; FKs e CHECKs impedem relações/valores inválidos. | Validar ambiente, ligação, migration numa base vazia, execução repetida da seed, preservação de dados existentes, hashes e constraints. **Estado: Concluído.** |
| 3 | Autenticação API e interface: login, logout, perfil atual e proteção das rotas. | Incrementos 1–2; protocolo de sessão aprovado no incremento 0. | Conta de demonstração válida autentica; inválida é recusada; logout invalida a sessão; perfil requer autenticação; respostas não expõem hash. | Testes de integração para sucesso/falha, sessão ausente, expirada e logout; validação manual do fluxo de UI. |
| 4 | Módulo de projetos API/UI: criação, listagem, detalhe, edição, eliminação e pesquisa por nome. | Incremento 3 e política de projetos do incremento 0. | CRUD e pesquisa funcionam; cada projeto fica associado a uma equipa; utilizadores só consultam/alteram operações permitidas; eliminação respeita política aprovada. | Testes de API por operação, filtros, 401/403/404/409, integridade referencial e fluxo manual da interface. |
| 5 | Módulo de tarefas API/UI: criação, detalhe, edição, eliminação e filtros por estado/prioridade. | Incremento 4 e política de tarefas/eliminação. | Tarefas pertencem a um projeto; apenas enums aprovados são aceites; filtros combinados produzem resultados corretos; autorização é aplicada. | Testes de API para CRUD, enums, filtros, dependências/status codes e validação manual da interface. |
| 6 | Responsáveis API/UI: listar elegíveis/atuais, associar vários utilizadores e remover associação. | Incrementos 2–5 e critério de elegibilidade/permissões do incremento 0. | Uma tarefa aceita vários utilizadores elegíveis; associação duplicada não cria duplicado; utilizador não elegível é recusado; remoção funciona. | Testes para elegibilidade, duplicados, autorização e integridade da tabela associativa; validar seletor na interface. |
| 7 | Comentários API/UI: adicionar e listar, com autor e data atribuídos pelo servidor. | Incrementos 3 e 5 e política de comentários do incremento 0. | Comentário associa-se à tarefa; autor é o utilizador autenticado; data é gerada pelo sistema; consulta e criação aplicam permissões. | Testes de integração para autoria, timestamps, validação e acesso negado; validar fluxo da interface. |
| 8 | Painel inicial React: projetos acessíveis, contagens por estado, navegação, filtros e estados de interface. | Incrementos 3–7 e contratos API estabilizados. | Painel lista apenas projetos permitidos, mostra zero para estados sem tarefas e navega para detalhe; loading, empty e error states são compreensíveis. | Testes de componentes/fluxo e validação manual no browser em viewport responsivo. |
| 9 | Revisão final e estabilização. | Incrementos 1–8. | Fluxos completos correspondem aos critérios; documentação, OpenAPI, seed e implementação coincidem; sem regressões conhecidas. | Suite de testes, lint, type-check, build, validação OpenAPI, smoke test manual e revisão de segurança das regras de acesso. |

## 5. Política de desenvolvimento incremental

- Implementar um incremento de cada vez e manter a aplicação executável.
- Antes de cada incremento, confirmar os critérios e as dependências; não alargar o âmbito sem aprovação.
- Rever os diffs e erros reportados, corrigir regressões relacionadas e atualizar este plano com evidência.
- Não guardar passwords, tokens ou outras credenciais reais no repositório.
- Não marcar uma etapa como concluída apenas porque o código compila: executar os testes definidos para os critérios dessa etapa.
- Registar decisões novas em documentação antes de as tratar como regras implementáveis.

## 6. Estado atual

| Item | Estado |
|---|---|
| Documentação e escopo Ficha 03 | Consolidado neste plano; detalhes de autorização pendentes. |
| Stack | Aprovada; scaffold configurado com npm workspaces, React/Vite e Express/TypeScript. |
| Código da aplicação | Scaffold, schema/migrations e seed de demonstração criados; funcionalidades de domínio e autenticação por implementar. |
| Incremento 0 | Bloqueado à espera da validação do formador. |
| Incremento 1 | Concluído para a estrutura inicial, dependências, scripts e configuração do Vitest. |
| Incremento 2 | Variáveis de ambiente, schema Prisma, migration inicial, ligação e seed repetível verificados. |
| Incrementos 3–9 | Por iniciar; dependências conforme a tabela. |
