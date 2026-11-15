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
import {
  createOpaqueToken,
  hashSessionToken,
} from '../src/auth/session.js'
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

describe('authentication API', () => {
  let temporaryDirectory: string
  let database: PrismaClient
  let server: Server
  let baseUrl: string
  let apiBaseUrl: string

  beforeAll(async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), 'matriz-auth-test-'))
    const databaseUrl = `file:${join(temporaryDirectory, 'auth.db')}`

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
      body: JSON.stringify({
        email,
        password,
      }),
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

  async function createSessionFor(userId: string) {
    const token = createOpaqueToken()
    const csrfToken = createOpaqueToken()
    await database.session.create({
      data: {
        tokenHash: hashSessionToken(token),
        csrfTokenHash: hashSessionToken(csrfToken),
        userId,
        expiresAt: new Date(Date.now() + 60_000),
      },
    })
    return {
      cookie: `matriz_session=${token}`,
      csrfToken,
    }
  }

  it('creates an HttpOnly session for valid credentials without exposing the hash', async () => {
    const { response, cookie, body } = await login()
    const storedSession = await database.session.findFirstOrThrow({
      where: { userId: body.user.id },
    })

    expect(response.status).toBe(200)
    expect(body.user.email).toBe('ana.demo@example.test')
    expect(body.user.id).toBe('demo-user-a')
    expect(body).not.toHaveProperty('passwordHash')
    expect(body.csrfToken).toBeTruthy()
    expect(new Date(body.expiresAt).getTime()).toBeGreaterThan(Date.now())
    expect(cookie).toMatch(/^matriz_session=[A-Za-z0-9_-]{43}$/)
    expect(response.headers.get('set-cookie')).toContain('HttpOnly')
    expect(response.headers.get('set-cookie')).toContain('SameSite=Lax')
    expect(response.headers.get('set-cookie')).toContain('Max-Age=28800')
    expect(response.headers.get('set-cookie')).toContain('Path=/api/v1')
    expect(storedSession.tokenHash).not.toBe(cookie.split('=')[1])
  })

  it('marks the session cookie Secure in production', async () => {
    const originalNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    try {
      const { response } = await login()
      expect(response.headers.get('set-cookie')).toContain('Secure')
    } finally {
      if (originalNodeEnv === undefined) {
        delete process.env.NODE_ENV
      } else {
        process.env.NODE_ENV = originalNodeEnv
      }
    }
  })

  it('returns the same unauthorized response for unknown users and wrong passwords', async () => {
    const attempts = await Promise.all([
      fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'http://localhost:5173',
        },
        body: JSON.stringify({
          email: 'missing@example.test',
          password: demoPasswords.userA,
        }),
      }),
      fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'http://localhost:5173',
        },
        body: JSON.stringify({
          email: 'ana.demo@example.test',
          password: 'wrong-password',
        }),
      }),
    ])
    const bodies = await Promise.all(attempts.map((response) => response.json()))

    expect(attempts.map((response) => response.status)).toEqual([401, 401])
    expect(bodies[0]).toEqual(bodies[1])
  })

  it('validates login input and rejects unapproved origins', async () => {
    const invalidBody = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'http://localhost:5173',
      },
      body: JSON.stringify({
        email: 'ana.demo@example.test',
        password: demoPasswords.userA,
        userId: 'demo-user-b',
      }),
    })
    const invalidOrigin = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://attacker.example',
      },
      body: JSON.stringify({
        email: 'ana.demo@example.test',
        password: demoPasswords.userA,
      }),
    })

    expect(invalidBody.status).toBe(422)
    expect(invalidOrigin.status).toBe(403)
  })

  it('allows the methods and CSRF header required by the API contract', async () => {
    const response = await fetch(`${baseUrl}/logout`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:5173',
        'Access-Control-Request-Method': 'PATCH',
        'Access-Control-Request-Headers': 'content-type,x-csrf-token',
      },
    })

    expect(response.status).toBe(204)
    expect(response.headers.get('access-control-allow-origin')).toBe(
      'http://localhost:5173',
    )
    expect(response.headers.get('access-control-allow-methods')).toContain(
      'PATCH',
    )
    expect(response.headers.get('access-control-allow-methods')).toContain(
      'DELETE',
    )
    expect(response.headers.get('access-control-allow-headers')).toContain(
      'X-CSRF-Token',
    )
  })

  it('requires a valid session to read the profile', async () => {
    const anonymous = await fetch(`${baseUrl}/me`)
    const { cookie } = await login()
    const profile = await fetch(`${baseUrl}/me`, {
      headers: { Cookie: cookie },
    })
    const profileBody = (await profile.json()) as {
      user: { id: string; email: string }
      csrfToken: string
    }

    expect(anonymous.status).toBe(401)
    expect(profile.status).toBe(200)
    expect(profileBody.user).toEqual({
      id: 'demo-user-a',
      name: 'Ana Demonstração',
      email: 'ana.demo@example.test',
    })
    expect(profileBody.csrfToken).toBeTruthy()
  })

  it('requires CSRF protection and invalidates the session on logout', async () => {
    const { cookie, body } = await login()
    const profileResponse = await fetch(`${baseUrl}/me`, {
      headers: { Cookie: cookie },
    })
    const profileBody = (await profileResponse.json()) as {
      csrfToken: string
    }
    const rejectedLogout = await fetch(`${baseUrl}/logout`, {
      method: 'POST',
      headers: { Cookie: cookie },
    })
    const rejectedOldToken = await fetch(`${baseUrl}/logout`, {
      method: 'POST',
      headers: {
        Cookie: cookie,
        'X-CSRF-Token': body.csrfToken,
      },
    })
    const acceptedLogout = await fetch(`${baseUrl}/logout`, {
      method: 'POST',
      headers: {
        Cookie: cookie,
        'X-CSRF-Token': profileBody.csrfToken,
      },
    })
    const profileAfterLogout = await fetch(`${baseUrl}/me`, {
      headers: { Cookie: cookie },
    })

    expect(rejectedLogout.status).toBe(403)
    expect(profileResponse.status).toBe(200)
    expect(profileBody.csrfToken).not.toBe(body.csrfToken)
    expect(rejectedOldToken.status).toBe(403)
    expect(acceptedLogout.status).toBe(204)
    expect(acceptedLogout.headers.get('set-cookie')).toContain('Max-Age=0')
    expect(profileAfterLogout.status).toBe(401)
  })

  it('rejects and removes expired server-side sessions', async () => {
    const token = createOpaqueToken()
    const csrfToken = createOpaqueToken()
    await database.session.create({
      data: {
        tokenHash: hashSessionToken(token),
        csrfTokenHash: hashSessionToken(csrfToken),
        userId: 'demo-user-a',
        expiresAt: new Date(Date.now() - 1_000),
      },
    })

    const response = await fetch(`${baseUrl}/me`, {
      headers: { Cookie: `matriz_session=${token}` },
    })
    const body = (await response.json()) as { code: string }
    const expiredSession = await database.session.findUnique({
      where: { tokenHash: hashSessionToken(token) },
    })

    expect(response.status).toBe(401)
    expect(body.code).toBe('SESSION_EXPIRED')
    expect(response.headers.get('set-cookie')).toContain('Max-Age=0')
    expect(expiredSession).toBeNull()
  })

  it('enforces team authorization on direct project, task, comment, and assignment API requests', async () => {
    const anonymousProjectList = await fetch(`${apiBaseUrl}/projects`)
    const anonymousProjectCreate = await fetch(`${apiBaseUrl}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teamId: 'demo-team-a',
        name: 'Projeto sem sessão',
      }),
    })
    const ana = await login()
    const bruno = await login('bruno.demo@example.test', demoPasswords.userB)

    expect(ana.response.status).toBe(200)
    expect(bruno.response.status).toBe(200)
    expect(anonymousProjectList.status).toBe(401)
    expect(anonymousProjectCreate.status).toBe(401)

    const anaOwnProject = await fetch(
      `${apiBaseUrl}/projects/demo-project-a`,
      { headers: { Cookie: ana.cookie } },
    )
    const brunoOwnProject = await fetch(
      `${apiBaseUrl}/projects/demo-project-b`,
      { headers: { Cookie: bruno.cookie } },
    )
    const anaCannotReadBrunoProject = await fetch(
      `${apiBaseUrl}/projects/demo-project-b`,
      { headers: { Cookie: ana.cookie } },
    )
    const brunoCannotReadAnaProject = await fetch(
      `${apiBaseUrl}/projects/demo-project-a`,
      { headers: { Cookie: bruno.cookie } },
    )
    expect(anaOwnProject.status).toBe(200)
    expect(brunoOwnProject.status).toBe(200)
    expect(anaCannotReadBrunoProject.status).toBe(404)
    expect(brunoCannotReadAnaProject.status).toBe(404)

    const deniedCreateInOtherTeam = await fetch(`${apiBaseUrl}/projects`, {
      method: 'POST',
      headers: {
        Cookie: bruno.cookie,
        'X-CSRF-Token': bruno.body.csrfToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        teamId: 'demo-team-a',
        name: 'Projeto sem autorização',
      }),
    })
    expect(deniedCreateInOtherTeam.status).toBe(403)

    const projectResponse = await fetch(`${apiBaseUrl}/projects`, {
      method: 'POST',
      headers: {
        Cookie: ana.cookie,
        'X-CSRF-Token': ana.body.csrfToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        teamId: 'demo-team-a',
        name: 'Projeto restrito para testes',
        ownerId: 'demo-user-b',
      }),
    })
    expect(projectResponse.status).toBe(422)

    const createdProjectResponse = await fetch(`${apiBaseUrl}/projects`, {
      method: 'POST',
      headers: {
        Cookie: ana.cookie,
        'X-CSRF-Token': ana.body.csrfToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        teamId: 'demo-team-a',
        name: 'Projeto restrito para testes',
      }),
    })
    const createdProject = (await createdProjectResponse.json()) as {
      id: string
      ownerId: string
    }
    expect(createdProjectResponse.status).toBe(201)
    expect(createdProject.ownerId).toBe('demo-user-a')
    expect(
      await database.project.findUniqueOrThrow({
        where: { id: createdProject.id },
      }),
    ).toMatchObject({ ownerId: 'demo-user-a' })

    const taskResponse = await fetch(
      `${apiBaseUrl}/projects/${createdProject.id}/tasks`,
      {
        method: 'POST',
        headers: {
          Cookie: ana.cookie,
          'X-CSRF-Token': ana.body.csrfToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Tarefa protegida',
          status: 'TODO',
          priority: 'MEDIUM',
        }),
      },
    )
    const task = (await taskResponse.json()) as { id: string }
    expect(taskResponse.status).toBe(201)

    const anonymousTask = await fetch(`${apiBaseUrl}/tasks/${task.id}`)
    const anonymousComments = await fetch(
      `${apiBaseUrl}/tasks/${task.id}/comments`,
    )
    const anonymousAssignees = await fetch(
      `${apiBaseUrl}/tasks/${task.id}/assignees`,
    )
    expect(anonymousTask.status).toBe(401)
    expect(anonymousComments.status).toBe(401)
    expect(anonymousAssignees.status).toBe(401)

    const brunoProject = await fetch(
      `${apiBaseUrl}/projects/${createdProject.id}`,
      { headers: { Cookie: bruno.cookie } },
    )
    const brunoTasks = await fetch(
      `${apiBaseUrl}/projects/${createdProject.id}/tasks`,
      { headers: { Cookie: bruno.cookie } },
    )
    const brunoTask = await fetch(`${apiBaseUrl}/tasks/${task.id}`, {
      headers: { Cookie: bruno.cookie },
    })
    const brunoComments = await fetch(
      `${apiBaseUrl}/tasks/${task.id}/comments`,
      { headers: { Cookie: bruno.cookie } },
    )
    const brunoAssignments = await fetch(
      `${apiBaseUrl}/tasks/${task.id}/assignees`,
      { headers: { Cookie: bruno.cookie } },
    )
    const brunoEligible = await fetch(
      `${apiBaseUrl}/tasks/${task.id}/eligible-assignees`,
      { headers: { Cookie: bruno.cookie } },
    )
    const brunoProjects = await fetch(`${apiBaseUrl}/projects`, {
      headers: { Cookie: bruno.cookie },
    })
    const brunoProjectsBody = (await brunoProjects.json()) as Array<{
      id: string
    }>

    expect(brunoProject.status).toBe(404)
    expect(brunoTasks.status).toBe(404)
    expect(brunoTask.status).toBe(404)
    expect(brunoComments.status).toBe(404)
    expect(brunoAssignments.status).toBe(404)
    expect(brunoEligible.status).toBe(404)
    expect(brunoProjectsBody.some(({ id }) => id === createdProject.id)).toBe(false)

    const unauthorizedComment = await fetch(
      `${apiBaseUrl}/tasks/${task.id}/comments`,
      {
        method: 'POST',
        headers: {
          Cookie: bruno.cookie,
          'X-CSRF-Token': bruno.body.csrfToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: 'Comentário sem acesso' }),
      },
    )
    const unauthorizedAssignment = await fetch(
      `${apiBaseUrl}/tasks/${task.id}/assignees/demo-user-b`,
      {
        method: 'PUT',
        headers: {
          Cookie: bruno.cookie,
          'X-CSRF-Token': bruno.body.csrfToken,
        },
      },
    )

    expect(unauthorizedComment.status).toBe(404)
    expect(unauthorizedAssignment.status).toBe(404)
  })

  it('scopes project lists and direct operations to accessible projects', async () => {
    const ana = await login()
    const bruno = await login('bruno.demo@example.test', demoPasswords.userB)

    const [anaListResponse, brunoListResponse] = await Promise.all([
      fetch(`${apiBaseUrl}/projects`, { headers: { Cookie: ana.cookie } }),
      fetch(`${apiBaseUrl}/projects`, { headers: { Cookie: bruno.cookie } }),
    ])
    const anaProjects = (await anaListResponse.json()) as Array<{
      id: string
      ownerId: string
    }>
    const brunoProjects = (await brunoListResponse.json()) as Array<{
      id: string
      ownerId: string
    }>

    expect(anaListResponse.status).toBe(200)
    expect(brunoListResponse.status).toBe(200)
    expect(anaProjects.map(({ id }) => id)).toContain('demo-project-a')
    expect(anaProjects.map(({ id }) => id)).not.toContain('demo-project-b')
    expect(brunoProjects.map(({ id }) => id)).toContain('demo-project-b')
    expect(brunoProjects.map(({ id }) => id)).not.toContain('demo-project-a')
    expect(anaProjects.find(({ id }) => id === 'demo-project-a')?.ownerId).toBe(
      'demo-user-a',
    )

    const [brunoRead, brunoUpdate, brunoDelete, brunoCreate] = await Promise.all([
      fetch(`${apiBaseUrl}/projects/demo-project-a`, {
        headers: { Cookie: bruno.cookie },
      }),
      fetch(`${apiBaseUrl}/projects/demo-project-a`, {
        method: 'PATCH',
        headers: {
          Cookie: bruno.cookie,
          'X-CSRF-Token': bruno.body.csrfToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Alteração sem acesso' }),
      }),
      fetch(`${apiBaseUrl}/projects/demo-project-a`, {
        method: 'DELETE',
        headers: {
          Cookie: bruno.cookie,
          'X-CSRF-Token': bruno.body.csrfToken,
        },
      }),
      fetch(`${apiBaseUrl}/projects`, {
        method: 'POST',
        headers: {
          Cookie: bruno.cookie,
          'X-CSRF-Token': bruno.body.csrfToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId: 'demo-team-a',
          name: 'Projeto numa equipa inacessível',
        }),
      }),
    ])

    expect(brunoRead.status).toBe(404)
    expect(brunoUpdate.status).toBe(404)
    expect(brunoDelete.status).toBe(404)
    expect(brunoCreate.status).toBe(403)
  })

  it('completes project create, list/search, read, update, and dependency-free delete via the API', async () => {
    const owner = await login()
    const projectName = 'Projeto para fluxo CRUD'
    const createResponse = await fetch(`${apiBaseUrl}/projects`, {
      method: 'POST',
      headers: {
        Cookie: owner.cookie,
        'X-CSRF-Token': owner.body.csrfToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        teamId: 'demo-team-a',
        name: projectName,
        description: 'Descrição inicial.',
      }),
    })
    const project = (await createResponse.json()) as {
      id: string
      teamId: string
      ownerId: string
      name: string
      description: string
    }

    expect(createResponse.status).toBe(201)
    expect(project).toMatchObject({
      teamId: 'demo-team-a',
      ownerId: 'demo-user-a',
      name: projectName,
      description: 'Descrição inicial.',
    })

    const listResponse = await fetch(
      `${apiBaseUrl}/projects?search=${encodeURIComponent('CRUD')}`,
      { headers: { Cookie: owner.cookie } },
    )
    const listedProjects = (await listResponse.json()) as Array<{
      id: string
      ownerId: string
    }>
    expect(listResponse.status).toBe(200)
    expect(listedProjects.map(({ id }) => id)).toEqual([project.id])
    expect(listedProjects).toContainEqual(
      expect.objectContaining({ id: project.id, ownerId: 'demo-user-a' }),
    )

    const readResponse = await fetch(
      `${apiBaseUrl}/projects/${project.id}`,
      { headers: { Cookie: owner.cookie } },
    )
    expect(readResponse.status).toBe(200)

    const updateResponse = await fetch(
      `${apiBaseUrl}/projects/${project.id}`,
      {
        method: 'PATCH',
        headers: {
          Cookie: owner.cookie,
          'X-CSRF-Token': owner.body.csrfToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Projeto CRUD atualizado',
          description: null,
        }),
      },
    )
    expect(updateResponse.status).toBe(200)
    expect(await updateResponse.json()).toMatchObject({
      id: project.id,
      name: 'Projeto CRUD atualizado',
      description: null,
      ownerId: 'demo-user-a',
    })

    const deleteResponse = await fetch(
      `${apiBaseUrl}/projects/${project.id}`,
      {
        method: 'DELETE',
        headers: {
          Cookie: owner.cookie,
          'X-CSRF-Token': owner.body.csrfToken,
        },
      },
    )
    expect(deleteResponse.status).toBe(204)

    const readAfterDelete = await fetch(
      `${apiBaseUrl}/projects/${project.id}`,
      { headers: { Cookie: owner.cookie } },
    )
    expect(readAfterDelete.status).toBe(404)
  })

  it('enforces project name and description lengths on create and update', async () => {
    const owner = await login()
    const projectHeaders = {
      Cookie: owner.cookie,
      'X-CSRF-Token': owner.body.csrfToken,
      'Content-Type': 'application/json',
    }

    for (const [invalidProject, field] of [
      [{ teamId: 'demo-team-a', name: 'ab' }, 'name'],
      [{ teamId: 'demo-team-a', name: '   ' }, 'name'],
      [{ teamId: 'demo-team-a', name: 'p'.repeat(101) }, 'name'],
      [
        { teamId: 'demo-team-a', name: 'Valid', description: 'd'.repeat(1001) },
        'description',
      ],
    ]) {
      const response = await fetch(`${apiBaseUrl}/projects`, {
        method: 'POST',
        headers: projectHeaders,
        body: JSON.stringify(invalidProject),
      })
      const error = (await response.json()) as {
        code: string
        details: Array<{ field: string }>
      }
      expect(response.status).toBe(422)
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.details[0]?.field).toBe(field)
    }

    const createResponse = await fetch(`${apiBaseUrl}/projects`, {
      method: 'POST',
      headers: projectHeaders,
      body: JSON.stringify({
        teamId: 'demo-team-a',
        name: 'abc',
        description: 'd'.repeat(1000),
      }),
    })
    const createdProject = (await createResponse.json()) as { id: string }
    expect(createResponse.status).toBe(201)

    for (const [invalidUpdate, field] of [
      [{ name: 'ab' }, 'name'],
      [{ name: '   ' }, 'name'],
      [{ name: 'p'.repeat(101) }, 'name'],
      [{ description: 'd'.repeat(1001) }, 'description'],
    ]) {
      const response = await fetch(
        `${apiBaseUrl}/projects/${createdProject.id}`,
        {
          method: 'PATCH',
          headers: projectHeaders,
          body: JSON.stringify(invalidUpdate),
        },
      )
      const error = (await response.json()) as {
        code: string
        details: Array<{ field: string }>
      }

      const blankNameUpdate = await fetch(
        `${apiBaseUrl}/projects/${createdProject.id}`,
        {
          method: 'PATCH',
          headers: projectHeaders,
          body: JSON.stringify({ name: '   ' }),
        },
      )
      expect(blankNameUpdate.status).toBe(422)
      expect(await blankNameUpdate.json()).toMatchObject({
        code: 'VALIDATION_ERROR',
        details: [
          {
            field: 'name',
            message: 'O nome do projeto não pode conter apenas espaços.',
          },
        ],
      })
      expect(response.status).toBe(422)
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.details[0]?.field).toBe(field)
    }

    const boundaryUpdate = await fetch(
      `${apiBaseUrl}/projects/${createdProject.id}`,
      {
        method: 'PATCH',
        headers: projectHeaders,
        body: JSON.stringify({
          name: 'p'.repeat(100),
          description: 'd'.repeat(1000),
        }),
      },
    )
    expect(boundaryUpdate.status).toBe(200)

    const deleteResponse = await fetch(
      `${apiBaseUrl}/projects/${createdProject.id}`,
      {
        method: 'DELETE',
        headers: {
          Cookie: owner.cookie,
          'X-CSRF-Token': owner.body.csrfToken,
        },
      },
    )
    expect(deleteResponse.status).toBe(204)
  })

  it('completes task create, list, read, update, and dependency-free delete for an accessible project', async () => {
    const owner = await login()
    const headers = {
      Cookie: owner.cookie,
      'X-CSRF-Token': owner.body.csrfToken,
      'Content-Type': 'application/json',
    }
    const projectResponse = await fetch(`${apiBaseUrl}/projects`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        teamId: 'demo-team-a',
        name: 'Projeto para tarefas CRUD',
      }),
    })
    const project = (await projectResponse.json()) as { id: string }
    expect(projectResponse.status).toBe(201)

    const blankTitleResponse = await fetch(
      `${apiBaseUrl}/projects/${project.id}/tasks`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: '   ',
          status: 'TODO',
          priority: 'LOW',
        }),
      },
    )
    expect(blankTitleResponse.status).toBe(422)
    expect(await blankTitleResponse.json()).toMatchObject({
      code: 'VALIDATION_ERROR',
      details: [
        {
          field: 'title',
          message: 'O título da tarefa não pode conter apenas espaços.',
        },
      ],
    })

    for (const [invalidTask, field] of [
      [{ title: 'ab', status: 'TODO', priority: 'LOW' }, 'title'],
      [
        { title: 't'.repeat(151), status: 'TODO', priority: 'LOW' },
        'title',
      ],
      [
        {
          title: 'Título válido',
          description: 'd'.repeat(2001),
          status: 'TODO',
          priority: 'LOW',
        },
        'description',
      ],
    ] as const) {
      const response = await fetch(
        `${apiBaseUrl}/projects/${project.id}/tasks`,
        { method: 'POST', headers, body: JSON.stringify(invalidTask) },
      )
      expect(response.status).toBe(422)
      expect(await response.json()).toMatchObject({
        code: 'VALIDATION_ERROR',
        details: [{ field }],
      })
    }

    const defaultTaskResponse = await fetch(
      `${apiBaseUrl}/projects/${project.id}/tasks`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ title: 'Tarefa com valores por omissão' }),
      },
    )
    const defaultTask = await defaultTaskResponse.json()
    expect(defaultTaskResponse.status).toBe(201)
    expect(defaultTask).toMatchObject({
      title: 'Tarefa com valores por omissão',
      status: 'TODO',
      priority: 'MEDIUM',
    })

    const createResponse = await fetch(
      `${apiBaseUrl}/projects/${project.id}/tasks`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: 'Tarefa para fluxo CRUD',
          description: 'Descrição inicial.',
          status: 'TODO',
          priority: 'LOW',
        }),
      },
    )
    const task = (await createResponse.json()) as {
      id: string
      projectId: string
      title: string
      status: string
      priority: string
    }
    expect(createResponse.status).toBe(201)
    expect(task).toMatchObject({
      projectId: project.id,
      title: 'Tarefa para fluxo CRUD',
      status: 'TODO',
      priority: 'LOW',
    })

    const boundaryTaskResponse = await fetch(
      `${apiBaseUrl}/projects/${project.id}/tasks`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: 't'.repeat(150),
          description: 'd'.repeat(2000),
        }),
      },
    )
    expect(boundaryTaskResponse.status).toBe(201)
    const boundaryTask = (await boundaryTaskResponse.json()) as { id: string }

    const listResponse = await fetch(
      `${apiBaseUrl}/projects/${project.id}/tasks`,
      { headers: { Cookie: owner.cookie } },
    )
    expect(listResponse.status).toBe(200)
    const listedTasks = (await listResponse.json()) as Array<{ id: string }>
    expect(listedTasks.map(({ id }) => id).sort()).toEqual(
      [defaultTask.id, task.id, boundaryTask.id].sort(),
    )

    const secondTaskResponse = await fetch(
      `${apiBaseUrl}/projects/${project.id}/tasks`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: 'Tarefa concluída',
          status: 'DONE',
          priority: 'MEDIUM',
        }),
      },
    )
    const secondTask = (await secondTaskResponse.json()) as { id: string }
    expect(secondTaskResponse.status).toBe(201)

    for (const [filters, expectedIds] of [
      ['?status=TODO', [defaultTask.id, task.id, boundaryTask.id]],
      [
        '?priority=MEDIUM',
        [defaultTask.id, secondTask.id, boundaryTask.id],
      ],
      ['?status=TODO&priority=LOW', [task.id]],
    ] as const) {
      const filteredResponse = await fetch(
        `${apiBaseUrl}/projects/${project.id}/tasks${filters}`,
        { headers: { Cookie: owner.cookie } },
      )
      expect(filteredResponse.status).toBe(200)
      const filteredTasks = (await filteredResponse.json()) as Array<{
        id: string
      }>
      expect(filteredTasks.map(({ id }) => id).sort()).toEqual(
        [...expectedIds].sort(),
      )
    }

    const readResponse = await fetch(`${apiBaseUrl}/tasks/${task.id}`, {
      headers: { Cookie: owner.cookie },
    })
    expect(readResponse.status).toBe(200)
    expect(await readResponse.json()).toMatchObject({ id: task.id })

    const updateResponse = await fetch(`${apiBaseUrl}/tasks/${task.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        title: 'Tarefa atualizada',
        description: null,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
      }),
    })
    expect(updateResponse.status).toBe(200)
    expect(await updateResponse.json()).toMatchObject({
      id: task.id,
      projectId: project.id,
      title: 'Tarefa atualizada',
      description: null,
      status: 'IN_PROGRESS',
      priority: 'HIGH',
    })

    const blankTitleUpdate = await fetch(`${apiBaseUrl}/tasks/${task.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ title: '   ' }),
    })
    expect(blankTitleUpdate.status).toBe(422)
    expect(await blankTitleUpdate.json()).toMatchObject({
      code: 'VALIDATION_ERROR',
      details: [
        {
          field: 'title',
          message: 'O título da tarefa não pode conter apenas espaços.',
        },
      ],
    })

    for (const [invalidUpdate, field] of [
      [{ title: 'ab' }, 'title'],
      [{ title: 't'.repeat(151) }, 'title'],
      [{ description: 'd'.repeat(2001) }, 'description'],
    ] as const) {
      const response = await fetch(`${apiBaseUrl}/tasks/${task.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(invalidUpdate),
      })
      expect(response.status).toBe(422)
      expect(await response.json()).toMatchObject({
        code: 'VALIDATION_ERROR',
        details: [{ field }],
      })
    }

    const boundaryUpdate = await fetch(`${apiBaseUrl}/tasks/${task.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        title: 't'.repeat(150),
        description: 'd'.repeat(2000),
      }),
    })
    expect(boundaryUpdate.status).toBe(200)

    const updatedFilterResponse = await fetch(
      `${apiBaseUrl}/projects/${project.id}/tasks?status=IN_PROGRESS&priority=HIGH`,
      { headers: { Cookie: owner.cookie } },
    )
    expect(updatedFilterResponse.status).toBe(200)
    expect(await updatedFilterResponse.json()).toMatchObject([
      { id: task.id, status: 'IN_PROGRESS', priority: 'HIGH' },
    ])

    const deleteResponse = await fetch(`${apiBaseUrl}/tasks/${task.id}`, {
      method: 'DELETE',
      headers: {
        Cookie: owner.cookie,
        'X-CSRF-Token': owner.body.csrfToken,
      },
    })
    expect(deleteResponse.status).toBe(204)
    expect(
      (await fetch(`${apiBaseUrl}/tasks/${task.id}`, {
        headers: { Cookie: owner.cookie },
      })).status,
    ).toBe(404)

    const deleteSecondTaskResponse = await fetch(
      `${apiBaseUrl}/tasks/${secondTask.id}`,
      {
        method: 'DELETE',
        headers: {
          Cookie: owner.cookie,
          'X-CSRF-Token': owner.body.csrfToken,
        },
      },
    )
    expect(deleteSecondTaskResponse.status).toBe(204)

    for (const taskId of [defaultTask.id, boundaryTask.id]) {
      const deleteAdditionalTaskResponse = await fetch(
        `${apiBaseUrl}/tasks/${taskId}`,
        {
          method: 'DELETE',
          headers: {
            Cookie: owner.cookie,
            'X-CSRF-Token': owner.body.csrfToken,
          },
        },
      )
      expect(deleteAdditionalTaskResponse.status).toBe(204)
    }

    const deleteProjectResponse = await fetch(
      `${apiBaseUrl}/projects/${project.id}`,
      {
        method: 'DELETE',
        headers: {
          Cookie: owner.cookie,
          'X-CSRF-Token': owner.body.csrfToken,
        },
      },
    )
    expect(deleteProjectResponse.status).toBe(204)
  })

  it('returns per-project task counts including zero states and reflects each task mutation', async () => {
    const owner = await login()
    const headers = {
      Cookie: owner.cookie,
      'X-CSRF-Token': owner.body.csrfToken,
      'Content-Type': 'application/json',
    }
    const projectResponse = await fetch(`${apiBaseUrl}/projects`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        teamId: 'demo-team-a',
        name: 'Projeto para contagens',
      }),
    })
    const project = (await projectResponse.json()) as { id: string }
    expect(projectResponse.status).toBe(201)

    const anonymousDashboard = await fetch(`${apiBaseUrl}/dashboard`)
    expect(anonymousDashboard.status).toBe(401)

    const otherUser = await login(
      'bruno.demo@example.test',
      demoPasswords.userB,
    )
    const otherDashboardResponse = await fetch(`${apiBaseUrl}/dashboard`, {
      headers: { Cookie: otherUser.cookie },
    })
    expect(otherDashboardResponse.status).toBe(200)
    const otherDashboard = (await otherDashboardResponse.json()) as Array<{
      project: { id: string }
    }>
    expect(otherDashboard.some(({ project: row }) => row.id === project.id)).toBe(
      false,
    )

    const getTaskCounts = async () => {
      const response = await fetch(`${apiBaseUrl}/dashboard`, {
        headers: { Cookie: owner.cookie },
      })
      expect(response.status).toBe(200)
      const dashboard = (await response.json()) as Array<{
        project: { id: string }
        taskCountsByStatus: {
          TODO: number
          IN_PROGRESS: number
          DONE: number
        }
      }>
      const projectSummary = dashboard.find(
        ({ project: dashboardProject }) => dashboardProject.id === project.id,
      )
      expect(projectSummary).toBeDefined()
      return projectSummary?.taskCountsByStatus
    }

    expect(await getTaskCounts()).toEqual({
      TODO: 0,
      IN_PROGRESS: 0,
      DONE: 0,
    })

    const taskResponse = await fetch(
      `${apiBaseUrl}/projects/${project.id}/tasks`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: 'Tarefa para contagem',
          status: 'TODO',
          priority: 'LOW',
        }),
      },
    )
    const task = (await taskResponse.json()) as { id: string }
    expect(taskResponse.status).toBe(201)
    expect(await getTaskCounts()).toEqual({
      TODO: 1,
      IN_PROGRESS: 0,
      DONE: 0,
    })

    const updateResponse = await fetch(`${apiBaseUrl}/tasks/${task.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status: 'DONE' }),
    })
    expect(updateResponse.status).toBe(200)
    expect(await getTaskCounts()).toEqual({
      TODO: 0,
      IN_PROGRESS: 0,
      DONE: 1,
    })

    const deleteTaskResponse = await fetch(`${apiBaseUrl}/tasks/${task.id}`, {
      method: 'DELETE',
      headers: {
        Cookie: owner.cookie,
        'X-CSRF-Token': owner.body.csrfToken,
      },
    })
    expect(deleteTaskResponse.status).toBe(204)
    expect(await getTaskCounts()).toEqual({
      TODO: 0,
      IN_PROGRESS: 0,
      DONE: 0,
    })

    const deleteProjectResponse = await fetch(
      `${apiBaseUrl}/projects/${project.id}`,
      {
        method: 'DELETE',
        headers: {
          Cookie: owner.cookie,
          'X-CSRF-Token': owner.body.csrfToken,
        },
      },
    )
    expect(deleteProjectResponse.status).toBe(204)
    const dashboardResponse = await fetch(`${apiBaseUrl}/dashboard`, {
      headers: { Cookie: owner.cookie },
    })
    const dashboard = (await dashboardResponse.json()) as Array<{
      project: { id: string }
    }>
    expect(dashboard.some(({ project: row }) => row.id === project.id)).toBe(
      false,
    )
  })

  it('derives project ownership and comment authorship from the session and restricts project management to the owner', async () => {
    const owner = await login()
    const projectResponse = await fetch(`${apiBaseUrl}/projects`, {
      method: 'POST',
      headers: {
        Cookie: owner.cookie,
        'X-CSRF-Token': owner.body.csrfToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        teamId: 'demo-team-a',
        name: 'Projeto com proprietário',
      }),
    })
    const project = (await projectResponse.json()) as { id: string }

    const member = await database.user.create({
      data: {
        id: 'team-a-member',
        name: 'Membro de demonstração',
        email: 'member.demo@example.test',
        passwordHash: 'unused-test-hash',
      },
    })
    await database.teamMembership.create({
      data: { teamId: 'demo-team-a', userId: member.id },
    })
    const memberSession = await createSessionFor(member.id)

    const memberCanRead = await fetch(
      `${apiBaseUrl}/projects/${project.id}`,
      { headers: { Cookie: memberSession.cookie } },
    )
    const ownerCanEditProject = await fetch(
      `${apiBaseUrl}/projects/${project.id}`,
      {
        method: 'PATCH',
        headers: {
          Cookie: owner.cookie,
          'X-CSRF-Token': owner.body.csrfToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Projeto atualizado pelo proprietário' }),
      },
    )
    const memberCannotEditProject = await fetch(
      `${apiBaseUrl}/projects/${project.id}`,
      {
        method: 'PATCH',
        headers: {
          Cookie: memberSession.cookie,
          'X-CSRF-Token': memberSession.csrfToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Alteração não autorizada' }),
      },
    )
    const memberCannotDeleteProject = await fetch(
      `${apiBaseUrl}/projects/${project.id}`,
      {
        method: 'DELETE',
        headers: {
          Cookie: memberSession.cookie,
          'X-CSRF-Token': memberSession.csrfToken,
        },
      },
    )

    expect(projectResponse.status).toBe(201)
    expect(memberCanRead.status).toBe(200)
    expect(ownerCanEditProject.status).toBe(200)
    expect(memberCannotEditProject.status).toBe(403)
    expect(memberCannotDeleteProject.status).toBe(403)

    const taskResponse = await fetch(
      `${apiBaseUrl}/projects/${project.id}/tasks`,
      {
        method: 'POST',
        headers: {
          Cookie: owner.cookie,
          'X-CSRF-Token': owner.body.csrfToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Tarefa com comentário',
          status: 'TODO',
          priority: 'LOW',
        }),
      },
    )
    const task = (await taskResponse.json()) as { id: string }

    const spoofedComment = await fetch(
      `${apiBaseUrl}/tasks/${task.id}/comments`,
      {
        method: 'POST',
        headers: {
          Cookie: memberSession.cookie,
          'X-CSRF-Token': memberSession.csrfToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: 'Comentário de teste',
          authorId: 'demo-user-b',
        }),
      },
    )
    expect(spoofedComment.status).toBe(422)

    const commentResponse = await fetch(
      `${apiBaseUrl}/tasks/${task.id}/comments`,
      {
        method: 'POST',
        headers: {
          Cookie: memberSession.cookie,
          'X-CSRF-Token': memberSession.csrfToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: 'Comentário de membro autorizado' }),
      },
    )
    const comment = (await commentResponse.json()) as {
      id: string
      author: { id: string }
      content: string
    }

    expect(commentResponse.status).toBe(201)
    expect(comment.author.id).toBe(member.id)
    expect(
      await database.comment.findFirstOrThrow({
        where: { id: comment.id },
      }),
    ).toMatchObject({ authorId: member.id, taskId: task.id })

    const assigned = await fetch(
      `${apiBaseUrl}/tasks/${task.id}/assignees/${member.id}`,
      {
        method: 'PUT',
        headers: {
          Cookie: owner.cookie,
          'X-CSRF-Token': owner.body.csrfToken,
        },
      },
    )
    const listedAssignments = await fetch(
      `${apiBaseUrl}/tasks/${task.id}/assignees`,
      { headers: { Cookie: owner.cookie } },
    )
    const assignments = (await listedAssignments.json()) as Array<{
      user: { id: string }
    }>
    expect(assigned.status).toBe(204)
    expect(listedAssignments.status).toBe(200)
    expect(assignments.map(({ user: assignedUser }) => assignedUser.id)).toContain(
      member.id,
    )

    const memberCanManageTask = await fetch(
      `${apiBaseUrl}/tasks/${task.id}`,
      {
        method: 'PATCH',
        headers: {
          Cookie: memberSession.cookie,
          'X-CSRF-Token': memberSession.csrfToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
      },
    )
    expect(memberCanManageTask.status).toBe(200)

    const eligibleResponse = await fetch(
      `${apiBaseUrl}/tasks/${task.id}/eligible-assignees`,
      { headers: { Cookie: memberSession.cookie } },
    )
    const eligibleUsers = (await eligibleResponse.json()) as Array<{
      id: string
    }>
    expect(eligibleResponse.status).toBe(200)
    expect(eligibleUsers.map(({ id }) => id)).toContain(member.id)
    expect(eligibleUsers.map(({ id }) => id)).not.toContain('demo-user-b')

    const ownerCannotDeleteProjectWithDependencies = await fetch(
      `${apiBaseUrl}/projects/${project.id}`,
      {
        method: 'DELETE',
        headers: {
          Cookie: owner.cookie,
          'X-CSRF-Token': owner.body.csrfToken,
        },
      },
    )
    expect(ownerCannotDeleteProjectWithDependencies.status).toBe(409)

    const ownerCannotDeleteTaskWithDependencies = await fetch(
      `${apiBaseUrl}/tasks/${task.id}`,
      {
        method: 'DELETE',
        headers: {
          Cookie: owner.cookie,
          'X-CSRF-Token': owner.body.csrfToken,
        },
      },
    )
    expect(ownerCannotDeleteTaskWithDependencies.status).toBe(409)
    expect(
      await database.task.findUnique({ where: { id: task.id } }),
    ).not.toBeNull()
    expect(
      await database.comment.findFirst({ where: { taskId: task.id } }),
    ).not.toBeNull()
    expect(
      await database.taskAssignment.findFirst({ where: { taskId: task.id } }),
    ).not.toBeNull()
  })
})
