import { execFileSync } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '@prisma/client'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { seedDemoData } from '../src/database/seed-data.js'

const apiDirectory = fileURLToPath(new URL('../', import.meta.url))
const schemaPath = resolve(apiDirectory, 'prisma/schema.prisma')
const prismaCliPath = resolve(
  dirname(fileURLToPath(import.meta.resolve('prisma'))),
  'index.js',
)

describe('SQLite schema migration', () => {
  let temporaryDirectory: string
  let databaseUrl: string
  let prisma: PrismaClient | undefined

  function getPrismaClient(): PrismaClient {
    if (!prisma) {
      throw new Error('Test database client has not been initialized')
    }

    return prisma
  }

  beforeAll(async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), 'matriz-db-test-'))
    databaseUrl = `file:${join(temporaryDirectory, 'test.db')}`

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

    prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    }, 30_000)
    await getPrismaClient().$connect()
  })

  afterAll(async () => {
    await prisma?.$disconnect()
    if (temporaryDirectory) {
      await rm(temporaryDirectory, { recursive: true, force: true })
    }
  })

  it('creates users, teams, projects, tasks, assignments, and comments', async () => {
    const user = await getPrismaClient().user.create({
      data: {
        name: 'Test User',
        email: 'test@example.invalid',
        passwordHash: 'test-hash',
      },
    })
    const team = await getPrismaClient().team.create({
      data: {
        name: 'Test Team',
        memberships: {
          create: {
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        },
      },
    })
    const project = await getPrismaClient().project.create({
      data: {
        name: 'Test Project',
        teamId: team.id,
      },
    })
    const task = await getPrismaClient().task.create({
      data: {
        title: 'Test Task',
        project: {
          connect: {
            id: project.id,
          },
        },
        assignments: {
          create: {
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        },
        comments: {
          create: {
            author: {
              connect: {
                id: user.id,
              },
            },
            content: 'Test comment',
          },
        },
      },
      include: {
        assignments: true,
        comments: true,
      },
    })

    expect(task.status).toBe('TODO')
    expect(task.priority).toBe('MEDIUM')
    expect(task.assignments).toHaveLength(1)
    expect(task.comments).toHaveLength(1)
    expect(task.comments[0]?.authorId).toBe(user.id)
  })

  it('enforces unique user email and assignment pairs', async () => {
    const user = await getPrismaClient().user.findUniqueOrThrow({
      where: {
        email: 'test@example.invalid',
      },
    })
    const task = await getPrismaClient().task.findFirstOrThrow()

    await expect(
      getPrismaClient().user.create({
        data: {
          name: 'Duplicate User',
          email: user.email,
          passwordHash: 'test-hash',
        },
      }),
    ).rejects.toThrow()

    await expect(
      getPrismaClient().taskAssignment.create({
        data: {
          taskId: task.id,
          userId: user.id,
        },
      }),
    ).rejects.toThrow()
  })

  it('enforces task status and priority values in SQLite', async () => {
    const project = await getPrismaClient().project.findFirstOrThrow()

    await expect(
      getPrismaClient().task.create({
        data: {
          title: 'Invalid status',
          projectId: project.id,
          status: 'BLOCKED',
        },
      }),
    ).rejects.toThrow()

    await expect(
      getPrismaClient().task.create({
        data: {
          title: 'Invalid priority',
          projectId: project.id,
          priority: 'URGENT',
        },
      }),
    ).rejects.toThrow()
  })

  it('prevents deleting records with dependent data', async () => {
    const project = await getPrismaClient().project.findFirstOrThrow()
    const task = await getPrismaClient().task.findFirstOrThrow()

    await expect(
      getPrismaClient().project.delete({
        where: {
          id: project.id,
        },
      }),
    ).rejects.toThrow()

    await expect(
      getPrismaClient().task.delete({
        where: {
          id: task.id,
        },
      }),
    ).rejects.toThrow()
  })

  it('seeds distinct demo users, teams, projects, and tasks without deleting data', async () => {
    const client = getPrismaClient()
    const initialUsers = await client.user.count()
    const initialTeams = await client.team.count()
    const initialProjects = await client.project.count()
    const initialTasks = await client.task.count()
    const credentials = {
      userA: 'local-demo-password-a-change-me',
      userB: 'local-demo-password-b-change-me',
    }

    await seedDemoData(client, credentials)
    await seedDemoData(client, credentials)
    await client.user.update({
      where: { email: 'ana.demo@example.test' },
      data: { name: 'Alteração local preservada' },
    })
    await seedDemoData(client, credentials)

    expect(await client.user.count()).toBe(initialUsers + 2)
    expect(await client.team.count()).toBe(initialTeams + 2)
    expect(await client.project.count()).toBe(initialProjects + 2)
    expect(await client.task.count()).toBe(initialTasks + 2)
    expect(
      await client.user.findUnique({
        where: { email: 'test@example.invalid' },
      }),
    ).not.toBeNull()

    const ana = await client.user.findUniqueOrThrow({
      where: { email: 'ana.demo@example.test' },
      include: {
        memberships: {
          include: {
            team: {
              include: {
                projects: {
                  include: {
                    tasks: true,
                  },
                },
              },
            },
          },
        },
      },
    })
    const bruno = await client.user.findUniqueOrThrow({
      where: { email: 'bruno.demo@example.test' },
      include: {
        memberships: {
          include: {
            team: {
              include: {
                projects: true,
              },
            },
          },
        },
      },
    })

    expect(ana.passwordHash).toMatch(/^scrypt\$[a-f0-9]+\$[a-f0-9]+$/)
    expect(ana.passwordHash).not.toContain(credentials.userA)
    expect(ana.name).toBe('Alteração local preservada')
    expect(ana.memberships).toHaveLength(1)
    expect(ana.memberships[0]?.team.projects).toHaveLength(1)
    expect(ana.memberships[0]?.team.projects[0]?.tasks).toHaveLength(1)
    expect(bruno.passwordHash).toMatch(/^scrypt\$[a-f0-9]+\$[a-f0-9]+$/)
    expect(bruno.memberships).toHaveLength(1)
    expect(bruno.memberships[0]?.team.projects).toHaveLength(1)
    expect(bruno.memberships[0]?.team.projects[0]?.id).not.toBe(
      ana.memberships[0]?.team.projects[0]?.id,
    )
  })

  it('rejects weak demo passwords before writing any data', async () => {
    const client = getPrismaClient()
    const initialUsers = await client.user.count()

    await expect(
      seedDemoData(client, {
        userA: 'short',
        userB: 'another-long-enough-demo-password',
      }),
    ).rejects.toThrow('DEMO_USER_A_PASSWORD must contain at least 12 characters')

    expect(await client.user.count()).toBe(initialUsers)
  })
})
