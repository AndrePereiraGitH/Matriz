import { Prisma } from '@prisma/client'
import type { PrismaClient, Project, Task } from '@prisma/client'
import { Router } from 'express'
import type { Response } from 'express'
import { getAuthenticatedSession, requireCsrfToken, requireSession } from '../auth/session.js'
import { validateTaskTitle } from './task-title.js'

const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'] as const
const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const

type TaskStatus = (typeof TASK_STATUSES)[number]
type TaskPriority = (typeof TASK_PRIORITIES)[number]

interface ProjectInput {
  teamId: string
  name: string
  description?: string | null
}

interface ProjectUpdate {
  name?: string
  description?: string | null
}

interface TaskInput {
  title: string
  description?: string | null
  status: TaskStatus
  priority: TaskPriority
}

interface TaskUpdate {
  title?: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function validationError(response: Response, field: string, message: string): void {
  response.status(422).json({
    code: 'VALIDATION_ERROR',
    message: 'Os dados enviados são inválidos.',
    details: [{ field, message }],
  })
}

function validateProjectText(
  value: unknown,
  response: Response,
  requireName = false,
): boolean {
  if (!isRecord(value)) {
    return true
  }
  if (requireName && !('name' in value)) {
    validationError(response, 'name', 'O nome do projeto é obrigatório.')
    return false
  }
  if ('name' in value) {
    if (typeof value.name !== 'string') {
      validationError(response, 'name', 'O nome do projeto tem de ser texto.')
      return false
    }
    if (!value.name.trim()) {
      validationError(
        response,
        'name',
        'O nome do projeto não pode conter apenas espaços.',
      )
      return false
    }
    const nameLength = Array.from(value.name).length
    const normalizedNameLength = Array.from(value.name.trim()).length
    if (
      nameLength < 3 ||
      nameLength > 100 ||
      normalizedNameLength < 3
    ) {
      validationError(
        response,
        'name',
        'O nome do projeto deve ter entre 3 e 100 caracteres.',
      )
      return false
    }
  }
  if ('description' in value && value.description !== null) {
    if (typeof value.description !== 'string') {
      validationError(response, 'description', 'A descrição tem de ser texto.')
      return false
    }
    if (Array.from(value.description).length > 1000) {
      validationError(
        response,
        'description',
        'A descrição do projeto não pode exceder 1000 caracteres.',
      )
      return false
    }
  }
  return true
}

function validateTaskText(
  value: unknown,
  response: Response,
  requireTitle = false,
): boolean {
  if (!isRecord(value)) {
    return true
  }
  if (requireTitle && !('title' in value)) {
    validationError(response, 'title', 'O título da tarefa é obrigatório.')
    return false
  }
  if ('title' in value) {
    const titleResult = validateTaskTitle(value.title)
    if (!titleResult.ok) {
      validationError(response, titleResult.field, titleResult.message)
      return false
    }
  }
  if ('description' in value && value.description !== null) {
    if (typeof value.description !== 'string') {
      validationError(response, 'description', 'A descrição tem de ser texto.')
      return false
    }
    if (Array.from(value.description).length > 2000) {
      validationError(
        response,
        'description',
        'A descrição da tarefa não pode exceder 2000 caracteres.',
      )
      return false
    }
  }
  if (
    'status' in value &&
    (typeof value.status !== 'string' ||
      !TASK_STATUSES.includes(value.status as TaskStatus))
  ) {
    validationError(response, 'status', 'O estado da tarefa é inválido.')
    return false
  }
  if (
    'priority' in value &&
    (typeof value.priority !== 'string' ||
      !TASK_PRIORITIES.includes(value.priority as TaskPriority))
  ) {
    validationError(response, 'priority', 'A prioridade da tarefa é inválida.')
    return false
  }
  return true
}

function parseCommentContent(value: unknown, response: Response): string | null {
  if (!isRecord(value)) {
    validationError(response, 'body', 'O conteúdo do comentário é obrigatório.')
    return null
  }
  if (Object.keys(value).some((key) => key !== 'content')) {
    validationError(
      response,
      'body',
      'O pedido só pode incluir o conteúdo do comentário.',
    )
    return null
  }
  if (typeof value.content !== 'string') {
    validationError(response, 'content', 'O conteúdo do comentário tem de ser texto.')
    return null
  }
  if (!value.content.trim()) {
    validationError(
      response,
      'content',
      'O conteúdo do comentário não pode conter apenas espaços.',
    )
    return null
  }
  if (Array.from(value.content).length > 2000) {
    validationError(
      response,
      'content',
      'O conteúdo do comentário deve ter entre 1 e 2000 caracteres.',
    )
    return null
  }
  return value.content.trim()
}

function sendNotFound(response: Response): void {
  response.status(404).json({
    code: 'NOT_FOUND',
    message: 'O recurso pedido não foi encontrado ou não está disponível.',
  })
}

function sendForbidden(response: Response): void {
  response.status(403).json({
    code: 'FORBIDDEN',
    message: 'Não tem autorização para executar esta operação.',
  })
}

function parseProjectInput(value: unknown): ProjectInput | null {
  if (!isRecord(value) || Object.keys(value).some(
    (key) => !['teamId', 'name', 'description'].includes(key),
  )) {
    return null
  }
  if (
    typeof value.teamId !== 'string' ||
    !value.teamId.trim() ||
    typeof value.name !== 'string' ||
    !value.name.trim() ||
    (value.description !== undefined &&
      value.description !== null &&
      typeof value.description !== 'string')
  ) {
    return null
  }
  return {
    teamId: value.teamId.trim(),
    name: value.name.trim(),
    description:
      typeof value.description === 'string' ? value.description.trim() : value.description,
  }
}

function parseProjectUpdate(value: unknown): ProjectUpdate | null {
  if (
    !isRecord(value) ||
    Object.keys(value).length === 0 ||
    Object.keys(value).some((key) => !['name', 'description'].includes(key))
  ) {
    return null
  }
  if (
    ('name' in value && (typeof value.name !== 'string' || !value.name.trim())) ||
    ('description' in value &&
      value.description !== null &&
      typeof value.description !== 'string')
  ) {
    return null
  }
  return {
    ...(typeof value.name === 'string' ? { name: value.name.trim() } : {}),
    ...('description' in value
      ? {
          description:
            typeof value.description === 'string'
              ? value.description.trim()
              : value.description === null
                ? null
                : undefined,
        }
      : {}),
  }
}

function parseTaskInput(value: unknown): TaskInput | null {
  if (!isRecord(value) || Object.keys(value).some(
    (key) => !['title', 'description', 'status', 'priority'].includes(key),
  )) {
    return null
  }
  if (
    typeof value.title !== 'string' ||
    !value.title.trim() ||
    (value.description !== undefined &&
      value.description !== null &&
      typeof value.description !== 'string') ||
    (value.status !== undefined &&
      (typeof value.status !== 'string' ||
        !TASK_STATUSES.includes(value.status as TaskStatus))) ||
    (value.priority !== undefined &&
      (typeof value.priority !== 'string' ||
        !TASK_PRIORITIES.includes(value.priority as TaskPriority)))
  ) {
    return null
  }
  return {
    title: value.title.trim(),
    description:
      typeof value.description === 'string' ? value.description.trim() : value.description,
    status: (value.status as TaskStatus | undefined) ?? 'TODO',
    priority: (value.priority as TaskPriority | undefined) ?? 'MEDIUM',
  }
}

function parseTaskUpdate(value: unknown): TaskUpdate | null {
  if (
    !isRecord(value) ||
    Object.keys(value).length === 0 ||
    Object.keys(value).some(
      (key) => !['title', 'description', 'status', 'priority'].includes(key),
    )
  ) {
    return null
  }
  if (
    ('title' in value && (typeof value.title !== 'string' || !value.title.trim())) ||
    ('description' in value &&
      value.description !== null &&
      typeof value.description !== 'string') ||
    ('status' in value &&
      (typeof value.status !== 'string' ||
        !TASK_STATUSES.includes(value.status as TaskStatus))) ||
    ('priority' in value &&
      (typeof value.priority !== 'string' ||
        !TASK_PRIORITIES.includes(value.priority as TaskPriority)))
  ) {
    return null
  }
  return {
    ...(typeof value.title === 'string' ? { title: value.title.trim() } : {}),
    ...('description' in value
      ? {
          description:
            typeof value.description === 'string'
              ? value.description.trim()
              : value.description === null
                ? null
                : undefined,
        }
      : {}),
    ...(typeof value.status === 'string'
      ? { status: value.status as TaskStatus }
      : {}),
    ...(typeof value.priority === 'string'
      ? { priority: value.priority as TaskPriority }
      : {}),
  }
}

function parseIdentifier(value: string | string[] | undefined): string | null {
  const identifier = Array.isArray(value)
    ? value.length === 1
      ? value[0]
      : undefined
    : value
  return identifier && identifier.trim() ? identifier.trim() : null
}

function publicProject(project: Project) {
  return {
    id: project.id,
    teamId: project.teamId,
    ownerId: project.ownerId,
    name: project.name,
    description: project.description,
  }
}

function publicTask(task: Task) {
  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
  }
}

async function findProjectForMember(
  database: PrismaClient,
  projectId: string,
  userId: string,
) {
  const project = await database.project.findUnique({
    where: { id: projectId },
    include: {
      team: {
        select: {
          memberships: {
            where: { userId },
            select: { userId: true },
          },
        },
      },
    },
  })
  if (!project || project.team.memberships.length === 0) {
    return null
  }
  return project
}

async function findTaskForMember(
  database: PrismaClient,
  taskId: string,
  userId: string,
) {
  const task = await database.task.findUnique({ where: { id: taskId } })
  if (!task) {
    return null
  }
  const project = await findProjectForMember(database, task.projectId, userId)
  return project ? { task, project } : null
}

function sendDatabaseConflict(response: Response): void {
  response.status(409).json({
    code: 'CONFLICT',
    message: 'O recurso tem dados associados e não pode ser eliminado.',
  })
}

function isForeignKeyConflict(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === 'P2003' || error.code === 'P2014')
  )
}

export function createDomainRouter(database: PrismaClient): Router {
  const router = Router()
  router.use(requireSession(database))

  router.get('/teams', async (_request, response, next) => {
    try {
      const { user } = getAuthenticatedSession(response)
      const teams = await database.team.findMany({
        where: { memberships: { some: { userId: user.id } } },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      })
      response.status(200).json(teams)
    } catch (error) {
      next(error)
    }
  })

  router.get('/dashboard', async (_request, response, next) => {
    try {
      const { user } = getAuthenticatedSession(response)
      const projects = await database.project.findMany({
        where: {
          team: { memberships: { some: { userId: user.id } } },
        },
        orderBy: { name: 'asc' },
      })
      const taskCounts = await database.task.groupBy({
        by: ['projectId', 'status'],
        where: { projectId: { in: projects.map(({ id }) => id) } },
        _count: { _all: true },
      })
      const countsByProject = new Map<
        string,
        Record<TaskStatus, number>
      >(
        projects.map(({ id }) => [
          id,
          { TODO: 0, IN_PROGRESS: 0, DONE: 0 },
        ]),
      )
      for (const count of taskCounts) {
        const projectCounts = countsByProject.get(count.projectId)
        const status = TASK_STATUSES.find(
          (taskStatus) => taskStatus === count.status,
        )
        if (projectCounts && status) {
          projectCounts[status] = count._count._all
        }
      }

      response.status(200).json(
        projects.map((project) => ({
          project: publicProject(project),
          taskCountsByStatus: countsByProject.get(project.id),
        })),
      )
    } catch (error) {
      next(error)
    }
  })

  router.get('/projects', async (request, response, next) => {
    try {
      const { user } = getAuthenticatedSession(response)
      const search = request.query.search
      if (search !== undefined && typeof search !== 'string') {
        validationError(response, 'search', 'O parâmetro deve ser texto.')
        return
      }

      const projects = await database.project.findMany({
        where: {
          team: { memberships: { some: { userId: user.id } } },
          ...(typeof search === 'string' && search.trim()
            ? { name: { contains: search.trim() } }
            : {}),
        },
        orderBy: { name: 'asc' },
      })
      response.status(200).json(projects.map(publicProject))
    } catch (error) {
      next(error)
    }
  })

  router.post('/projects', requireCsrfToken, async (request, response, next) => {
    try {
      const { user } = getAuthenticatedSession(response)
      if (!validateProjectText(request.body, response, true)) {
        return
      }
      if (
        isRecord(request.body) &&
        (typeof request.body.teamId !== 'string' || !request.body.teamId.trim())
      ) {
        validationError(response, 'teamId', 'Indique uma equipa válida.')
        return
      }
      const input = parseProjectInput(request.body)
      if (!input) {
        validationError(response, 'body', 'Indique teamId, name e description válidos.')
        return
      }
      const membership = await database.teamMembership.findUnique({
        where: {
          teamId_userId: { teamId: input.teamId, userId: user.id },
        },
      })
      if (!membership) {
        sendForbidden(response)
        return
      }

      const project = await database.project.create({
        data: {
          teamId: input.teamId,
          ownerId: user.id,
          name: input.name,
          description: input.description ?? null,
        },
      })
      response.status(201).json(publicProject(project))
    } catch (error) {
      next(error)
    }
  })

  router.get('/projects/:projectId', async (request, response, next) => {
    try {
      const { user } = getAuthenticatedSession(response)
      const projectId = parseIdentifier(request.params.projectId)
      const project = projectId
        ? await findProjectForMember(database, projectId, user.id)
        : null
      if (!project) {
        sendNotFound(response)
        return
      }
      response.status(200).json(publicProject(project))
    } catch (error) {
      next(error)
    }
  })

  router.patch(
    '/projects/:projectId',
    requireCsrfToken,
    async (request, response, next) => {
      try {
        const { user } = getAuthenticatedSession(response)
        const projectId = parseIdentifier(request.params.projectId)
        const project = projectId
          ? await findProjectForMember(database, projectId, user.id)
          : null
        if (!project) {
          sendNotFound(response)
          return
        }
        if (project.ownerId !== user.id) {
          sendForbidden(response)
          return
        }
        if (!validateProjectText(request.body, response)) {
          return
        }
        const input = parseProjectUpdate(request.body)
        if (!input) {
          validationError(response, 'body', 'Indique pelo menos um campo válido para atualizar.')
          return
        }
        const updated = await database.project.update({
          where: { id: project.id },
          data: input,
        })
        response.status(200).json(publicProject(updated))
      } catch (error) {
        next(error)
      }
    },
  )

  router.delete(
    '/projects/:projectId',
    requireCsrfToken,
    async (request, response, next) => {
      try {
        const { user } = getAuthenticatedSession(response)
        const projectId = parseIdentifier(request.params.projectId)
        const project = projectId
          ? await findProjectForMember(database, projectId, user.id)
          : null
        if (!project) {
          sendNotFound(response)
          return
        }
        if (project.ownerId !== user.id) {
          sendForbidden(response)
          return
        }
        try {
          await database.project.delete({ where: { id: project.id } })
        } catch (error) {
          if (isForeignKeyConflict(error)) {
            sendDatabaseConflict(response)
            return
          }
          throw error
        }
        response.status(204).end()
      } catch (error) {
        next(error)
      }
    },
  )

  router.get('/projects/:projectId/tasks', async (request, response, next) => {
    try {
      const { user } = getAuthenticatedSession(response)
      const projectId = parseIdentifier(request.params.projectId)
      const project = projectId
        ? await findProjectForMember(database, projectId, user.id)
        : null
      if (!project) {
        sendNotFound(response)
        return
      }
      const { status, priority } = request.query
      if (
        (status !== undefined &&
          (typeof status !== 'string' ||
            !TASK_STATUSES.includes(status as TaskStatus))) ||
        (priority !== undefined &&
          (typeof priority !== 'string' ||
            !TASK_PRIORITIES.includes(priority as TaskPriority)))
      ) {
        validationError(response, 'query', 'O filtro de estado ou prioridade é inválido.')
        return
      }
      const tasks = await database.task.findMany({
        where: {
          projectId: project.id,
          ...(typeof status === 'string' ? { status } : {}),
          ...(typeof priority === 'string' ? { priority } : {}),
        },
        orderBy: { createdAt: 'asc' },
      })
      response.status(200).json(tasks.map(publicTask))
    } catch (error) {
      next(error)
    }
  })

  router.post(
    '/projects/:projectId/tasks',
    requireCsrfToken,
    async (request, response, next) => {
      try {
        const { user } = getAuthenticatedSession(response)
        const projectId = parseIdentifier(request.params.projectId)
        const project = projectId
          ? await findProjectForMember(database, projectId, user.id)
          : null
        if (!project) {
          sendNotFound(response)
          return
        }
        if (!validateTaskText(request.body, response, true)) {
          return
        }
        const input = parseTaskInput(request.body)
        if (!input) {
          validationError(response, 'body', 'Indique title, status e priority válidos.')
          return
        }
        const task = await database.task.create({
          data: { ...input, projectId: project.id },
        })
        response.status(201).json(publicTask(task))
      } catch (error) {
        next(error)
      }
    },
  )

  router.get('/tasks/:taskId', async (request, response, next) => {
    try {
      const { user } = getAuthenticatedSession(response)
      const taskId = parseIdentifier(request.params.taskId)
      const result = taskId
        ? await findTaskForMember(database, taskId, user.id)
        : null
      if (!result) {
        sendNotFound(response)
        return
      }
      response.status(200).json(publicTask(result.task))
    } catch (error) {
      next(error)
    }
  })

  router.patch(
    '/tasks/:taskId',
    requireCsrfToken,
    async (request, response, next) => {
      try {
        const { user } = getAuthenticatedSession(response)
        const taskId = parseIdentifier(request.params.taskId)
        const result = taskId
          ? await findTaskForMember(database, taskId, user.id)
          : null
        if (!result) {
          sendNotFound(response)
          return
        }
        if (!validateTaskText(request.body, response)) {
          return
        }
        const input = parseTaskUpdate(request.body)
        if (!input) {
          validationError(response, 'body', 'Indique pelo menos um campo válido para atualizar.')
          return
        }
        const task = await database.task.update({
          where: { id: result.task.id },
          data: input,
        })
        response.status(200).json(publicTask(task))
      } catch (error) {
        next(error)
      }
    },
  )

  router.delete(
    '/tasks/:taskId',
    requireCsrfToken,
    async (request, response, next) => {
      try {
        const { user } = getAuthenticatedSession(response)
        const taskId = parseIdentifier(request.params.taskId)
        const result = taskId
          ? await findTaskForMember(database, taskId, user.id)
          : null
        if (!result) {
          sendNotFound(response)
          return
        }
        try {
          await database.task.delete({ where: { id: result.task.id } })
        } catch (error) {
          if (isForeignKeyConflict(error)) {
            sendDatabaseConflict(response)
            return
          }
          throw error
        }
        response.status(204).end()
      } catch (error) {
        next(error)
      }
    },
  )

  router.get('/tasks/:taskId/eligible-assignees', async (request, response, next) => {
    try {
      const { user } = getAuthenticatedSession(response)
      const taskId = parseIdentifier(request.params.taskId)
      const result = taskId
        ? await findTaskForMember(database, taskId, user.id)
        : null
      if (!result) {
        sendNotFound(response)
        return
      }
      const eligibleUsers = await database.user.findMany({
        where: {
          memberships: {
            some: { teamId: result.project.teamId },
          },
        },
        select: { id: true, name: true, email: true },
        orderBy: { name: 'asc' },
      })
      response.status(200).json(eligibleUsers)
    } catch (error) {
      next(error)
    }
  })

  router.get('/tasks/:taskId/assignees', async (request, response, next) => {
    try {
      const { user } = getAuthenticatedSession(response)
      const taskId = parseIdentifier(request.params.taskId)
      const result = taskId
        ? await findTaskForMember(database, taskId, user.id)
        : null
      if (!result) {
        sendNotFound(response)
        return
      }
      const assignments = await database.taskAssignment.findMany({
        where: { taskId: result.task.id },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { assignedAt: 'asc' },
      })
      response.status(200).json(
        assignments.map(({ user: assignedUser, assignedAt }) => ({
          user: assignedUser,
          assignedAt,
        })),
      )
    } catch (error) {
      next(error)
    }
  })

  router.put(
    '/tasks/:taskId/assignees/:userId',
    requireCsrfToken,
    async (request, response, next) => {
      try {
        const { user } = getAuthenticatedSession(response)
        const taskId = parseIdentifier(request.params.taskId)
        const userId = parseIdentifier(request.params.userId)
        const result = taskId
          ? await findTaskForMember(database, taskId, user.id)
          : null
        if (!result || !userId) {
          sendNotFound(response)
          return
        }
        const assignee = await database.user.findUnique({
          where: { id: userId },
          select: { id: true },
        })
        if (!assignee) {
          sendNotFound(response)
          return
        }
        const eligibleMembership = await database.teamMembership.findUnique({
          where: {
            teamId_userId: {
              teamId: result.project.teamId,
              userId,
            },
          },
        })
        if (!eligibleMembership) {
          validationError(
            response,
            'userId',
            'O utilizador não pertence à equipa do projeto e não pode ser atribuído.',
          )
          return
        }
        await database.taskAssignment.upsert({
          where: {
            taskId_userId: { taskId: result.task.id, userId },
          },
          create: { taskId: result.task.id, userId },
          update: {},
        })
        response.status(204).end()
      } catch (error) {
        next(error)
      }
    },
  )

  router.delete(
    '/tasks/:taskId/assignees/:userId',
    requireCsrfToken,
    async (request, response, next) => {
      try {
        const { user } = getAuthenticatedSession(response)
        const taskId = parseIdentifier(request.params.taskId)
        const userId = parseIdentifier(request.params.userId)
        const result = taskId
          ? await findTaskForMember(database, taskId, user.id)
          : null
        if (!result || !userId) {
          sendNotFound(response)
          return
        }
        await database.taskAssignment.deleteMany({
          where: { taskId: result.task.id, userId },
        })
        response.status(204).end()
      } catch (error) {
        next(error)
      }
    },
  )

  router.get('/tasks/:taskId/comments', async (request, response, next) => {
    try {
      const { user } = getAuthenticatedSession(response)
      const taskId = parseIdentifier(request.params.taskId)
      const result = taskId
        ? await findTaskForMember(database, taskId, user.id)
        : null
      if (!result) {
        sendNotFound(response)
        return
      }
      const comments = await database.comment.findMany({
        where: { taskId: result.task.id },
        include: {
          author: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'asc' },
      })
      response.status(200).json(
        comments.map(({ id, taskId: commentTaskId, author, content, createdAt }) => ({
          id,
          taskId: commentTaskId,
          author,
          content,
          createdAt,
        })),
      )
    } catch (error) {
      next(error)
    }
  })

  router.post(
    '/tasks/:taskId/comments',
    requireCsrfToken,
    async (request, response, next) => {
      try {
        const { user } = getAuthenticatedSession(response)
        const taskId = parseIdentifier(request.params.taskId)
        const result = taskId
          ? await findTaskForMember(database, taskId, user.id)
          : null
        if (!result) {
          sendNotFound(response)
          return
        }
        const content = parseCommentContent(request.body, response)
        if (content === null) {
          return
        }
        const comment = await database.comment.create({
          data: {
            taskId: result.task.id,
            authorId: user.id,
            content,
          },
          include: {
            author: { select: { id: true, name: true, email: true } },
          },
        })
        response.status(201).json({
          id: comment.id,
          taskId: comment.taskId,
          author: comment.author,
          content: comment.content,
          createdAt: comment.createdAt,
        })
      } catch (error) {
        next(error)
      }
    },
  )

  return router
}
