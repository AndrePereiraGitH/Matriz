# AGENTS.md

## 1. Purpose

These instructions define how AI coding agents must work in the Matriz repository. Follow them for all tasks unless the user explicitly approves a change to these instructions.

## 2. Documentation First

Before starting a task, read `README.md` and the relevant documentation in `docs/`, especially:

- `docs/requirements.md` for functional and non-functional requirements.
- `docs/user-stories.md` for user stories and acceptance criteria.
- `docs/constraints.md` for constraints, assumptions, technical decisions and scope.

Consult the exercise documents when historical context about earlier decisions is relevant. If documentation is missing, contradictory or insufficient, explain the issue and ask for clarification when it affects the implementation.

## 3. Respect Requirements and Scope

- Implement only functionality supported by documented requirements or explicitly approved by the user.
- Respect documented constraints, priorities and acceptance criteria.
- Do not treat assumptions, suggestions or future ideas as approved decisions.
- Do not introduce unapproved features, dependencies, technologies, architecture or external services.
- If a task conflicts with the documentation, explain the conflict and request clarification before proceeding.

## 4. Plan Before Significant Changes

Before making significant changes, present a concise plan describing:

1. The intended changes and their purpose.
2. The files likely to be affected.
3. Relevant risks, dependencies or unresolved questions.
4. The checks that will be performed.

Wait for approval before proceeding with significant changes. Small, local and reversible changes may be made directly when the task is clear and within the approved scope.

## 5. Limit Changes

- Modify only files necessary for the requested task.
- Avoid unrelated refactoring, formatting changes or file renaming.
- Preserve existing behaviour unless a change is required and approved.
- Do not overwrite or discard existing user work without permission.
- If additional changes become necessary, explain why and request approval when they exceed the original scope.

## 6. Destructive and Sensitive Actions

Obtain explicit approval before actions that may cause data loss, disrupt services or have significant consequences. This includes deleting or overwriting files, removing data, rewriting Git history, force-pushing, changing repository permissions, deploying changes or modifying production resources.

Do not assume that permission to implement a feature includes permission to perform these actions.

## 7. Security and Confidentiality

- Never expose, print, commit or transmit credentials, access tokens, private keys or other confidential information.
- Do not place secrets in source code, documentation, logs, examples or version control.
- Use placeholders in examples and follow established secure practices.
- Do not send project data to external services unless the user has explicitly approved it and the task requires it.
- If a secret may have been exposed, stop and inform the user without reproducing the secret.

## 8. Verification and Communication

After making changes:

- Run relevant tests, checks or validation steps when available and appropriate.
- Do not claim that tests or checks passed unless they were actually executed.
- Report the files changed and summarise the changes.
- State which tests or checks were run and their results.
- Clearly identify assumptions, unresolved questions, limitations and any checks that could not be performed.
- If no code was changed, explain why.

## 9. Documentation Maintenance

When an approved change affects requirements, user stories, constraints, assumptions or technical decisions, identify the relevant documentation that may need updating. Keep documentation consistent with the implemented behaviour and approved decisions.

Do not silently turn a proposed change into an approved requirement.

## 10. Technology-Neutral Approach

Do not assume a programming language, framework, database, architecture, testing tool or deployment platform until it has been selected and documented or explicitly approved by the user.

Choose implementation details only within the approved scope, and explain any decision that requires user input.