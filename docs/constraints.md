# Matriz — Constraints e Pressupostos

## 1. Objetivo

Este documento identifica as restrições conhecidas, os pressupostos de trabalho e as decisões técnicas que ainda não foram tomadas no projeto Matriz.

O objetivo é evitar que decisões não confirmadas sejam tratadas como requisitos do sistema.

## 2. Restrições conhecidas

Com base no enquadramento original do cliente, são conhecidas as seguintes condições:

- A aplicação destina-se à gestão de projetos e tarefas de equipas de trabalho.
- A aplicação deverá permitir organizar projetos.
- A aplicação deverá permitir gerir tarefas.
- A aplicação deverá permitir acompanhar o progresso do trabalho.
- A fase atual do projeto é dedicada à análise e especificação, não à implementação de código.

Não foram fornecidas outras restrições técnicas ou tecnológicas pelo cliente.

## 3. Pressupostos de trabalho

Para desenvolver a especificação inicial, considera-se que:

- Existem equipas de trabalho que utilizam a aplicação.
- Existem projetos que precisam de ser organizados.
- Existem tarefas associadas ao trabalho dos projetos.
- Os utilizadores precisam de consultar informação que lhes permita acompanhar o trabalho.

Estes pressupostos decorrem do objetivo geral descrito pelo cliente, mas os detalhes de funcionamento ainda precisam de ser confirmados.

## 4. Decisões ainda não tomadas

As seguintes decisões não devem ser assumidas nesta fase:

### 4.1. Utilizadores e autenticação

- Será necessário criar contas de utilizador?
- Como será feita a autenticação?
- Um utilizador poderá pertencer a várias equipas?
- Existirão diferentes tipos de utilizador ou permissões?

### 4.2. Equipas e projetos

- Como serão criadas e geridas as equipas?
- Como serão associados os projetos às equipas?
- Um projeto poderá pertencer a várias equipas?
- Quem poderá criar, editar ou eliminar projetos?

### 4.3. Tarefas

- Que informação deverá conter uma tarefa?
- Como serão atribuídas as tarefas?
- Que estados e prioridades estarão disponíveis?
- Como serão definidos os prazos?
- Existirá um histórico de alterações?

### 4.4. Tecnologia e arquitetura

Ainda não foram escolhidos:

- Linguagem de programação;
- Frameworks;
- Arquitetura da aplicação;
- Base de dados;
- Serviços externos;
- Modelo de alojamento;
- Mecanismos de autenticação e autorização.

Estas decisões deverão ser tomadas com base nos requisitos validados.

## 5. Segurança e privacidade

Como a aplicação poderá armazenar informação relativa a equipas, projetos, tarefas e utilizadores, será necessário analisar:

- Controlo de acesso à informação;
- Permissões dos utilizadores;
- Proteção dos dados armazenados;
- Privacidade da informação das equipas;
- Segurança das operações realizadas na aplicação.

Os mecanismos concretos de segurança ainda não estão definidos.

## 6. Limitações desta especificação

A informação inicial fornecida pelo cliente é genérica e não define detalhadamente:

- Funcionalidades;
- Regras de negócio;
- Requisitos técnicos;
- Prioridades;
- Perfis de utilizador;
- Fluxos de trabalho.

Por esse motivo, a especificação atual deve ser considerada preliminar e sujeita a validação.

## 7. Princípio de evolução

Qualquer nova decisão deverá:

1. Ter uma justificação baseada numa necessidade identificada.
2. Ser documentada.
3. Ser consistente com os requisitos e histórias de utilizador.
4. Ser validada antes de ser considerada parte definitiva da solução.