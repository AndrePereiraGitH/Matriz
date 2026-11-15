# Matriz — Plano de Implementação da Ficha 03

## 1. Objetivo e estado

Plano incremental para implementar o MVP documentado em [requirements.md](./requirements.md), usando a stack registada em [architecture.md](./architecture.md). O scaffold, a persistência, a autenticação, os endpoints de domínio protegidos e as interfaces CRUD de projetos e tarefas foram implementados. A interface de filtros de tarefas por estado e prioridade, o endpoint de contagens por projeto e a atualização das listas/contagens após operações também estão concluídos; as interfaces de comentários e atribuições continuam por implementar.

Estado global: **Autenticação e endpoints backend de projetos, tarefas, comentários e atribuições implementados com autorização por equipa/proprietário. As interfaces CRUD de projetos e tarefas, os filtros de tarefas por estado/prioridade, as contagens por estado em cada projeto e a atualização dos dados apresentados após operações estão concluídos. Interfaces de colaboração e outras decisões pendentes continuam por concluir.**

## 2. Decisões consolidadas

- Arquitetura: monólito modular.
- Stack planeada: TypeScript, React/Vite, Node.js/Express e SQLite/Prisma.
- Cada projeto pertence a uma equipa.
- Estados de tarefa: `TODO`, `IN_PROGRESS`, `DONE`.
- Prioridades: `LOW`, `MEDIUM`, `HIGH`.
- Contas de demonstração são criadas por seed; registo público e recuperação de palavra-passe ficam fora do MVP.
- O painel apresenta contagens por estado calculadas a partir das tarefas.
- Autenticação: sessão opaca persistida no SQLite; cookie HTTP-only `matriz_session`, validade absoluta de oito horas, `SameSite=Lax` e `Secure` em produção; token de sessão persistido apenas como hash SHA-256. Pedidos autenticados de escrita exigem token CSRF sincronizador.
- Autorização: apenas membros da equipa podem consultar projetos e gerir tarefas, comentários e atribuições; o proprietário inferido da sessão na criação é o único que pode editar/eliminar o projeto; responsáveis elegíveis são membros da equipa.

## 3. Decisões ainda pendentes

As seguintes decisões não bloqueiam as operações já implementadas:

1. Se um utilizador pode pertencer a várias equipas e se um projeto pode ser transferido entre equipas.
Projetos legados podem ter `owner_id` nulo porque o criador histórico não é conhecido. A migration não atribui um proprietário arbitrário.

## 4. Incrementos e critérios de aceitação

O incremento 1 foi concluído para a estrutura e os scripts iniciais. Os restantes incrementos continuam por iniciar ou bloqueados conforme indicado.

| # | Incremento / componentes previstos | Dependências | Critérios de aceitação | Verificação |
|---|---|---|---|---|
| 0 | Resolver decisões de acesso e rever documentos de requisitos, dados e API. | Aprovação da política de acesso. | Acesso por pertença à equipa, proprietário, operações de tarefas/comentários/atribuições e elegibilidade documentados. | Revisão humana e testes de autorização por utilizador. **Estado: Política de autorização aprovada; outras questões listadas na secção 3 continuam pendentes.** |
| 1 | Criar estrutura do repositório, scripts e aplicações TypeScript para interface e API. | Stack aprovada; o scaffold sem funcionalidades protegidas pode avançar enquanto o incremento 0 está bloqueado. | Aplicações arrancam localmente; configuração não contém segredos; verificações de tipos e build executam por scripts documentados. | `npm ci`, type-check, build, teste de arranque local e runner Vitest configurado. **Estado: Concluído para o scaffold.** |
| 2 | Configurar variáveis de ambiente e Prisma/SQLite; criar esquema, migrações e seed de utilizadores de demonstração, equipas e dados relacionais mínimos. | Incremento 1; regras de pertença/elegibilidade para seed de associação. | Configuração local não expõe credenciais reais; migração cria o esquema; seed manual é repetível sem apagar dados; passwords são guardadas como hashes; FKs e CHECKs impedem relações/valores inválidos. | Validar ambiente, ligação, migration numa base vazia, execução repetida da seed, preservação de dados existentes, hashes e constraints. **Estado: Concluído; migration de sessão adicionada sem reset dos dados locais.** |
| 3 | Autenticação API e interface: login, logout, perfil atual e tratamento de sessão inválida/expirada. | Incrementos 1–2; mecanismo de sessão aprovado. | Conta de demonstração válida autentica; inválida é recusada; logout invalida a sessão; perfil requer autenticação; respostas não expõem hash; UI encaminha para login com mensagem quando a sessão deixa de ser válida. | Testes de integração para sucesso/falha, cookie, origem, CSRF, sessão ausente/expirada e logout; type-check, build e validação manual do fluxo de UI. **Estado: Concluído e verificado.** |
| 4 | Módulo de projetos API/UI: criação, listagem, detalhe, edição, eliminação e pesquisa por nome. | Incremento 3 e regra de autorização aprovada. | Interface permite criar, pesquisar/listar, consultar, editar e eliminar projetos; estados de erro são apresentados; proprietário é derivado da sessão; criação exige pertença à equipa; somente proprietário edita/elimina; dependências impedem eliminação. | Testes API para 401/403/404/409, pesquisa, CRUD completo e integração com migration; validação manual no browser do fluxo UI/API/DB. **Concluído e verificado; a sessão, o projeto e a consulta do detalhe mantiveram-se após recarregar e reiniciar o backend; eliminação com tarefas associadas devolve 409.** |
| 5 | Módulo de tarefas API/UI: criação, listagem, detalhe, edição, eliminação e filtros por estado/prioridade. | Incremento 4 e regras de autorização aprovadas. | Interface lista e gere tarefas associadas a um projeto existente e autorizado; título obrigatório de 3–150 caracteres, descrição até 2000, estados/prioridades validados e valores iniciais `TODO`/`MEDIUM`; backend rejeita títulos compostos apenas por espaços; interface apresenta erros relevantes; eliminações dependentes são recusadas. | Teste de integração API para CRUD, filtros e limites/valores iniciais; teste manual no browser para estados vazio, criação, detalhe, edição, eliminação e 409; build, type-check e lint. **API e UI: CRUD, filtros e feedback de erros concluídos; validações e defaults cobertos por testes API.** |
| 6 | Responsáveis API/UI: listar elegíveis/atuais, associar vários utilizadores e remover associação. | Incrementos 2–5 e regra de elegibilidade aprovada. | Só membros da equipa consultam/gerem atribuições; apenas membros da equipa são elegíveis; duplicados não são criados. | Testes API de elegibilidade, isolamento, duplicados e remoção. **API: Concluída; UI: Pendente.** |
| 7 | Comentários API/UI: adicionar e listar, com autor e data atribuídos pelo servidor. | Incrementos 3 e 5 e regra de acesso aprovada. | Só membros da equipa consultam/comentam; autor e data vêm do backend; campos de autoria enviados pelo cliente são rejeitados. | Testes API de autoria, timestamps, acesso direto com duas contas e pedidos não autenticados. **API: Concluída; UI: Pendente.** |
| 8 | Painel/listagem React: projetos acessíveis, contagens por estado, navegação e estados de interface. | Incrementos 3–7 e contratos API estabilizados. | Lista apenas projetos permitidos, mostra contagens `TODO`/`IN_PROGRESS`/`DONE` por projeto incluindo zero, navega para detalhe e atualiza lista/contagens após operações; loading, empty e error states são compreensíveis. | Testes API para autorização e contagens incluindo alterações de estado; validação manual no browser da atualização após operações. **API e UI: implementadas; atualização testada manualmente.** |
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
| Documentação e escopo Ficha 03 | Consolidado neste plano; autorização e política restritiva de eliminação aprovadas; agregação do painel pendente. |
| Stack | Aprovada; scaffold configurado com npm workspaces, React/Vite e Express/TypeScript. |
| Código da aplicação | Scaffold, schema/migrations, seed, autenticação, API protegida de projetos/tarefas/comentários/atribuições, interfaces CRUD de projetos/tarefas e filtros de tarefas por estado/prioridade; interfaces de colaboração por implementar. |
| Incremento 0 | Política de autorização aprovada; demais decisões em aberto listadas na secção 3. |
| Incremento 1 | Concluído para a estrutura inicial, dependências, scripts e configuração do Vitest. |
| Incremento 2 | Variáveis de ambiente, schema Prisma, migrations, ligação e seed repetível verificados. |
| Incremento 3 | Login, perfil, logout e tratamento de sessão implementados; testes, type-check, build, lint, YAML e smoke test local passaram. |
| Incremento 4 | CRUD de projetos implementado na API e interface; teste de integração CRUD e verificação manual no browser concluídos. |
| Incremento 5 | CRUD de tarefas implementado na API e interface no contexto do detalhe do projeto; edição de estado/prioridade e filtros por ambos implementados; o contrato não define parâmetros de paginação; testes API cobrem filtros; verificação manual dos filtros no browser pendente. |
| Incrementos 6–7 | Endpoints backend protegidos implementados e testados; interfaces de atribuições e comentários pendentes. |
| Incrementos 8–9 | Por iniciar; painel aguarda confirmação da forma de agregação. |
