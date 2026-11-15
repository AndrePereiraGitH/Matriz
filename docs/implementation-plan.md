# Matriz — Plano de Implementação da Ficha 03

## 1. Objetivo e estado

Plano incremental para implementar o MVP documentado em [requirements.md](./requirements.md), usando a stack registada em [architecture.md](./architecture.md). O scaffold, a persistência, a autenticação, os endpoints de domínio protegidos e as interfaces CRUD de projetos e tarefas foram implementados. A interface de filtros de tarefas por estado e prioridade, o endpoint de contagens por projeto, a atualização das listas/contagens após operações, a gestão de responsáveis e os comentários estão concluídos. A revisão do Exercício 9 documenta os resultados, comandos, limitações e decisões de manutenção em [verification.md](./verification.md).

Estado global: **Autenticação e endpoints backend de projetos, tarefas, comentários e atribuições implementados com autorização por equipa/proprietário. As interfaces CRUD de projetos e tarefas, filtros de tarefas por estado/prioridade, contagens por estado em cada projeto, atualização dos dados apresentados após operações, gestão de responsáveis e comentários estão concluídos. Permanecem por resolver as decisões pendentes listadas na secção 3.**

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
| 4 | Módulo de projetos API/UI: criação, listagem, detalhe, edição, eliminação e pesquisa por nome. | Incremento 3 e regra de autorização aprovada. | Interface permite criar, pesquisar/listar, consultar, editar e eliminar projetos; estados de erro são apresentados; proprietário é derivado da sessão; criação exige pertença à equipa; somente proprietário edita/elimina; dependências impedem eliminação; submissões concorrentes não criam duplicados. | Testes API para 401/403/404/409, pesquisa, CRUD completo e integração com migration; validação manual no browser do fluxo UI/API/DB. **Concluído e verificado; a sessão, o projeto e a consulta do detalhe mantiveram-se após recarregar e reiniciar o backend; eliminação com tarefas associadas devolve 409.** |
| 5 | Módulo de tarefas API/UI: criação, listagem, detalhe, edição, eliminação e filtros por estado/prioridade. | Incremento 4 e regras de autorização aprovadas. | Interface lista e gere tarefas associadas a um projeto existente e autorizado; título obrigatório de 3–150 caracteres, descrição até 2000, estados/prioridades validados e valores iniciais `TODO`/`MEDIUM`; backend rejeita títulos compostos apenas por espaços; interface apresenta erros relevantes; eliminações dependentes são recusadas; pedidos repetidos não acrescentam registos duplicados. | Teste de integração API para CRUD, filtros e limites/valores iniciais; teste manual no browser para estados vazio, criação, detalhe, edição, eliminação e 409; build, type-check e lint. **API e UI: CRUD, filtros e feedback de erros concluídos; validações e defaults cobertos por testes API; filtros também verificados manualmente no browser.** |
| 6 | Responsáveis API/UI: listar elegíveis/atuais, associar vários utilizadores e remover associação. | Incrementos 2–5 e regra de elegibilidade aprovada. | Só membros da equipa consultam/gerem atribuições; Backend confirma existência e pertença do utilizador à equipa; pedidos repetidos não criam duplicados; interface atualiza a lista apenas após confirmação da API. | Testes API de elegibilidade, utilizador inexistente/não elegível, idempotência, múltiplas atribuições e remoção; validação manual no browser do fluxo UI. **API e UI: implementadas; testes API e smoke test UI concluídos.** |
| 7 | Comentários API/UI: adicionar e listar, com autor e data atribuídos pelo servidor. | Incrementos 3 e 5 e regra de acesso aprovada. | Só membros da equipa consultam/comentam; conteúdo entre 1 e 2000 caracteres sem espaços apenas; autor e data vêm do backend; campos de autoria enviados pelo cliente são rejeitados; submissões em curso não se repetem e a lista não duplica o comentário confirmado. | Testes API para limites, autoria, timestamps, acesso direto com duas contas e pedidos não autenticados; smoke test UI. **Concluído e verificado; formulário, validação, autoria, data e atualização da lista implementados.** |
| 8 | Painel/listagem React: projetos acessíveis, contagens por estado, navegação e estados de interface. | Incrementos 3–7 e contratos API estabilizados. | Lista apenas projetos permitidos; mostra contagens `TODO`/`IN_PROGRESS`/`DONE` por projeto incluindo zero, calculadas sobre todas as tarefas do projeto e não limitadas pelos filtros da listagem; atualiza lista/contagens após operações; loading, empty e error states são compreensíveis. | Testes API para autorização, independência dos filtros e contagens após alterações de estado; validação manual no browser da atualização após operações. **API e UI: implementadas; atualização testada manualmente.** |
| 9 | Revisão final e estabilização. | Incrementos 1–8. | Fluxos completos correspondem aos critérios; documentação, OpenAPI, seed e implementação coincidem; sem regressões conhecidas. | Suite de testes, lint, type-check, build, validação OpenAPI, smoke test manual e revisão de segurança das regras de acesso. **Fluxo completo UI/API/SQLite verificado numa base isolada; foram corrigidos o detalhe de tarefa desatualizado ao criar projetos e o carregamento de responsáveis/comentários logo após criar tarefas. Testes, lint, type-check e build passaram. A revisão manual do contrato e das regras de autorização foi concluída; a validação OpenAPI automatizada e uma auditoria de segurança de produção não foram executadas.** |

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
| Documentação e escopo Ficha 03 | Consolidado neste plano; autorização, política restritiva de eliminação e agregação do painel implementadas; outras decisões em aberto listadas na secção 3. |
| Stack | Aprovada; scaffold configurado com npm workspaces, React/Vite e Express/TypeScript. |
| Código da aplicação | Scaffold, schema/migrations, seed, autenticação, APIs protegidas de projetos/tarefas/comentários/atribuições e interfaces do painel inicial e de gestão de projetos, tarefas, responsáveis e comentários. |
| Incremento 0 | Política de autorização aprovada; demais decisões em aberto listadas na secção 3. |
| Incremento 1 | Concluído para a estrutura inicial, dependências, scripts e configuração do Vitest. |
| Incremento 2 | Variáveis de ambiente, schema Prisma, migrations, ligação e seed repetível verificados. |
| Incremento 3 | Login, perfil, logout e tratamento de sessão implementados; testes, type-check, build, lint, YAML e smoke test local passaram. |
| Incremento 4 | CRUD de projetos implementado na API e interface; teste de integração CRUD e verificação manual no browser concluídos. |
| Incremento 5 | CRUD de tarefas implementado na API e interface no contexto do detalhe do projeto; edição de estado/prioridade e filtros por ambos implementados e verificados por testes API e browser; o contrato não define parâmetros de paginação. |
| Incrementos 6–7 | Endpoints backend protegidos e interfaces de atribuições e comentários implementados e verificados com testes API e smoke tests no browser. |
| Incremento 8 | Painel inicial autenticado com projetos acessíveis e contagens de tarefas por estado por projeto implementado; atualização após operações verificada. |
| Incremento 9 | Fluxo funcional completo UI/API/SQLite verificado numa base temporária, incluindo reabertura e persistência de comentários/atribuições, logout e recusas 409; OpenAPI revisto manualmente e diferenças de documentação corrigidas. Auditoria de segurança de produção e validação OpenAPI automatizada não executadas. |
