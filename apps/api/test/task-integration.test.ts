import { execFileSync } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { AddressInfo } from 'node:net'
import type { Server } from 'node:http'
import { PrismaClient } from '@prisma/client'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { seedDemoData } from '../src/database/seed-data.js'

const apiDirectory = fileURLToPath(new URL('../', import.meta.url))
const schemaPath = resolve(apiDirectory, 'prisma/schema.prisma')
const prismaCliPath = resolve(
  dirname(fileURLToPath(import.meta.resolve('prisma'))),
  'index.js',
)
const demoPasswords = {
  userA: 'local-demo-password-a-change-me',
  userB: 'local-demo-password-b-change-me',
}

describe('Task Integration Tests (Exercício 3)', () => {
  let temporaryDirectory: string
  let database: PrismaClient
  let server: Server
  let baseUrl: string
  let apiBaseUrl: string

  beforeAll(async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), 'matriz-task-integration-test-'))
    const databaseUrl = `file:${join(temporaryDirectory, 'test-task.db')}`

    execFileSync(
      process.execPath,
      [prismaCliPath, 'migrate', 'deploy', '--schema', schemaPath],
      {
        cwd: apiDirectory,
        env: {
          ...process.env,
          DATABASE_URL: databaseUrl,
        },
        stdio: 'pipe',
      },
    )

    database = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    })
    await database.$connect()
    await seedDemoData(database, demoPasswords)

    server = createApp(database).listen(0, '127.0.0.1')
    await new Promise<void>((resolveServer, rejectServer) => {
      server.once('listening', resolveServer)
      server.once('error', rejectServer)
    })

    const address = server.address() as AddressInfo
    baseUrl = `http://127.0.0.1:${address.port}/api/v1/auth`
    apiBaseUrl = `http://127.0.0.1:${address.port}/api/v1`
  }, 30_000)

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolveClose, rejectClose) => {
        server.close((error) => {
          if (error) {
            rejectClose(error)
            return
          }
          resolveClose()
        })
      })
    }
    await database?.$disconnect()
    if (temporaryDirectory) {
      await rm(temporaryDirectory, { recursive: true, force: true })
    }
  })

  async function login(
    email = 'ana.demo@example.test',
    password = demoPasswords.userA,
  ) {
    const response = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'http://localhost:5173',
      },
      body: JSON.stringify({ email, password }),
    })
    const setCookie = response.headers.get('set-cookie')
    if (!setCookie) {
      throw new Error('Login response did not issue a session cookie')
    }

    const cookie = setCookie.split(';')[0]
    if (!cookie) {
      throw new Error('Session cookie was empty')
    }

    return {
      response,
      cookie,
      body: (await response.json()) as {
        user: { id: string; name: string; email: string }
        csrfToken: string
        expiresAt: string
      },
    }
  }

  it('cria uma tarefa válida, consulta-a via API e valida a persistência direta na base de dados', async () => {
    const member = await login('ana.demo@example.test', demoPasswords.userA)
    const headers = {
      Cookie: member.cookie,
      'X-CSRF-Token': member.body.csrfToken,
      'Content-Type': 'application/json',
    }

    // 1. Criar tarefa com valores por omissão para status e priority (C2 / T04)
    const createResponse = await fetch(
      `${apiBaseUrl}/projects/demo-project-a/tasks`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: 'Preparar relatório',
        }),
      },
    )

    expect(createResponse.status).toBe(201)
    const createdTask = (await createResponse.json()) as {
      id: string
      projectId: string
      title: string
      description: string | null
      status: string
      priority: string
      createdAt: string
      updatedAt: string
    }

    expect(createdTask).toEqual({
      id: expect.any(String),
      projectId: 'demo-project-a',
      title: 'Preparar relatório',
      description: null,
      status: 'TODO',
      priority: 'MEDIUM',
    })

    // 2. Consultar a tarefa individualmente via GET /api/v1/tasks/:taskId
    const getResponse = await fetch(`${apiBaseUrl}/tasks/${createdTask.id}`, {
      headers: { Cookie: member.cookie },
    })

    expect(getResponse.status).toBe(200)
    const retrievedTask = await getResponse.json()
    expect(retrievedTask).toEqual(createdTask)

    // 3. Consultar a listagem do projeto via GET /api/v1/projects/:projectId/tasks
    const listResponse = await fetch(
      `${apiBaseUrl}/projects/demo-project-a/tasks`,
      {
        headers: { Cookie: member.cookie },
      },
    )

    expect(listResponse.status).toBe(200)
    const tasksList = (await listResponse.json()) as Array<{ id: string }>
    expect(tasksList.some((task) => task.id === createdTask.id)).toBe(true)

    // 4. Verificar a persistência real na base de dados relacional (SQLite isolada)
    const persistedTask = await database.task.findUnique({
      where: { id: createdTask.id },
    })

    expect(persistedTask).not.toBeNull()
    expect(persistedTask).toMatchObject({
      id: createdTask.id,
      projectId: 'demo-project-a',
      title: 'Preparar relatório',
      description: null,
      status: 'TODO',
      priority: 'MEDIUM',
    })
    expect(persistedTask?.createdAt).toBeInstanceOf(Date)
    expect(persistedTask?.updatedAt).toBeInstanceOf(Date)
  })

  it('rejeita criação com título composto apenas por espaços (422) e não persiste a tarefa', async () => {
    const member = await login('ana.demo@example.test', demoPasswords.userA)
    const countBefore = await database.task.count({
      where: { projectId: 'demo-project-a' },
    })

    const response = await fetch(
      `${apiBaseUrl}/projects/demo-project-a/tasks`,
      {
        method: 'POST',
        headers: {
          Cookie: member.cookie,
          'X-CSRF-Token': member.body.csrfToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '   ',
        }),
      },
    )

    expect(response.status).toBe(422)
    const errorBody = await response.json()
    expect(errorBody).toMatchObject({
      code: 'VALIDATION_ERROR',
      details: [
        {
          field: 'title',
          message: 'O título da tarefa não pode conter apenas espaços.',
        },
      ],
    })

    // Garantir que nenhuma tarefa foi persistida
    const countAfter = await database.task.count({
      where: { projectId: 'demo-project-a' },
    })
    expect(countAfter).toBe(countBefore)
  })

  it('devolve 404 NOT_FOUND ao consultar recurso inexistente', async () => {
    const member = await login('ana.demo@example.test', demoPasswords.userA)

    const response = await fetch(`${apiBaseUrl}/tasks/non-existent-task-id`, {
      headers: { Cookie: member.cookie },
    })

    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body).toMatchObject({
      code: 'NOT_FOUND',
      message: 'O recurso pedido não foi encontrado ou não está disponível.',
    })
  })

  it('impõe permissões e devolve 404 a membro de outra equipa com identificador conhecido', async () => {
    // demo-task-a pertence a demo-team-a
    const otherTeamMember = await login(
      'bruno.demo@example.test',
      demoPasswords.userB,
    )

    const response = await fetch(`${apiBaseUrl}/tasks/demo-task-a`, {
      headers: { Cookie: otherTeamMember.cookie },
    })

    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body).toMatchObject({
      code: 'NOT_FOUND',
      message: 'O recurso pedido não foi encontrado ou não está disponível.',
    })
  })

  it('impõe permissões e impede membro de outra equipa de criar, alterar ou eliminar tarefas (IDOR)', async () => {
    const bruno = await login(
      'bruno.demo@example.test',
      demoPasswords.userB,
    )
    const headers = {
      Cookie: bruno.cookie,
      'X-CSRF-Token': bruno.body.csrfToken,
      'Content-Type': 'application/json',
    }

    // 1. Tentar criar tarefa num projeto de outra equipa
    const createAttempt = await fetch(
      `${apiBaseUrl}/projects/demo-project-a/tasks`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ title: 'Tentativa IDOR criação' }),
      },
    )
    expect(createAttempt.status).toBe(404)

    // 2. Tentar alterar tarefa de outra equipa
    const patchAttempt = await fetch(
      `${apiBaseUrl}/tasks/demo-task-a`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ title: 'Tentativa IDOR alteração' }),
      },
    )
    expect(patchAttempt.status).toBe(404)

    // 3. Tentar eliminar tarefa de outra equipa
    const deleteAttempt = await fetch(
      `${apiBaseUrl}/tasks/demo-task-a`,
      {
        method: 'DELETE',
        headers,
      },
    )
    expect(deleteAttempt.status).toBe(404)

    // 4. Tentar comentar tarefa de outra equipa
    const commentAttempt = await fetch(
      `${apiBaseUrl}/tasks/demo-task-a/comments`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ content: 'Tentativa IDOR comentário' }),
      },
    )
    expect(commentAttempt.status).toBe(404)
  })

  it('valida regras de elegibilidade na atribuição de responsáveis', async () => {
    const ana = await login('ana.demo@example.test', demoPasswords.userA)
    const headers = {
      Cookie: ana.cookie,
      'X-CSRF-Token': ana.body.csrfToken,
    }

    // Utilizador existente mas de outra equipa deve ser rejeitado com 422
    const ineligibleResponse = await fetch(
      `${apiBaseUrl}/tasks/demo-task-a/assignees/demo-user-b`,
      {
        method: 'PUT',
        headers,
      },
    )
    expect(ineligibleResponse.status).toBe(422)
    const ineligibleBody = await ineligibleResponse.json()
    expect(ineligibleBody).toMatchObject({
      code: 'VALIDATION_ERROR',
      details: [
        {
          field: 'userId',
          message:
            'O utilizador não pertence à equipa do projeto e não pode ser atribuído.',
        },
      ],
    })

    // Utilizador inexistente responde 404 de acordo com a especificação OpenAPI
    const nonexistentResponse = await fetch(
      `${apiBaseUrl}/tasks/demo-task-a/assignees/non-existent-user-id`,
      {
        method: 'PUT',
        headers,
      },
    )
    expect(nonexistentResponse.status).toBe(404)
    const nonexistentBody = await nonexistentResponse.json()
    expect(nonexistentBody).toMatchObject({
      code: 'NOT_FOUND',
    })
  })

  it('devolve 401 UNAUTHENTICATED ao consultar tarefa sem sessão autenticada', async () => {
    const response = await fetch(`${apiBaseUrl}/tasks/demo-task-a`)

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body).toMatchObject({
      code: 'UNAUTHENTICATED',
      message: 'Inicie sessão para continuar.',
    })
  })
})
