import { Router } from 'express'
import type { Request, Response } from 'express'
import type { PrismaClient } from '@prisma/client'
import { verifyPassword } from './password.js'
import {
  clearSessionCookie,
  createOpaqueToken,
  getAuthenticatedSession,
  hashSessionToken,
  requireCsrfToken,
  requireSession,
  SESSION_TTL_MS,
  setSessionCookie,
} from './session.js'

interface LoginInput {
  email: string
  password: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseLoginInput(value: unknown):
  | { input: LoginInput }
  | { errors: Array<{ field: string; message: string }> } {
  if (!isRecord(value)) {
    return {
      errors: [{ field: 'body', message: 'O corpo do pedido deve ser um objeto.' }],
    }
  }

  const errors: Array<{ field: string; message: string }> = []
  for (const key of Object.keys(value)) {
    if (key !== 'email' && key !== 'password') {
      errors.push({ field: key, message: 'Campo não permitido.' })
    }
  }

  const email = value.email
  const password = value.password
  if (
    typeof email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    errors.push({ field: 'email', message: 'Indique um endereço de email válido.' })
  }
  if (
    typeof password !== 'string' ||
    password.length < 1 ||
    password.length > 1024
  ) {
    errors.push({
      field: 'password',
      message: 'A palavra-passe é obrigatória e não pode exceder 1024 caracteres.',
    })
  }

  if (errors.length > 0 || typeof email !== 'string' || typeof password !== 'string') {
    return { errors }
  }

  return { input: { email: email.trim().toLowerCase(), password } }
}

function publicUser(user: { id: string; name: string; email: string }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  }
}

function sendValidationError(
  response: Response,
  errors: Array<{ field: string; message: string }>,
): void {
  response.status(422).json({
    code: 'VALIDATION_ERROR',
    message: 'Os dados enviados são inválidos.',
    details: errors,
  })
}

export function createAuthRouter(database: PrismaClient): Router {
  const router = Router()
  const authenticated = requireSession(database)

  router.post('/login', async (request, response, next) => {
    const parsedInput = parseLoginInput(request.body)
    if ('errors' in parsedInput) {
      sendValidationError(response, parsedInput.errors)
      return
    }

    try {
      const { email, password } = parsedInput.input
      const user = await database.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          passwordHash: true,
        },
      })

      const passwordMatches = await verifyPassword(
        password,
        user?.passwordHash ?? null,
      )
      if (!user || !passwordMatches) {
        response.status(401).json({
          code: 'INVALID_CREDENTIALS',
          message: 'Email ou palavra-passe inválidos.',
        })
        return
      }

      const existingTokenHash = request.headers.cookie
        ?.split(';')
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith('matriz_session='))
        ?.slice('matriz_session='.length)
      if (existingTokenHash && /^[A-Za-z0-9_-]{43}$/.test(existingTokenHash)) {
        await database.session.deleteMany({
          where: { tokenHash: hashSessionToken(existingTokenHash) },
        })
      }

      const sessionToken = createOpaqueToken()
      const csrfToken = createOpaqueToken()
      const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
      await database.session.create({
        data: {
          tokenHash: hashSessionToken(sessionToken),
          csrfTokenHash: hashSessionToken(csrfToken),
          userId: user.id,
          expiresAt,
        },
      })

      setSessionCookie(response, sessionToken)
      response.status(200).json({
        user: publicUser(user),
        csrfToken,
        expiresAt: expiresAt.toISOString(),
      })
    } catch (error) {
      next(error)
    }
  })

  router.get('/me', authenticated, async (_request, response, next) => {
    try {
      const { session, user } = getAuthenticatedSession(response)
      const csrfToken = createOpaqueToken()
      await database.session.update({
        where: { tokenHash: session.tokenHash },
        data: { csrfTokenHash: hashSessionToken(csrfToken) },
      })

      response.status(200).json({
        user: publicUser(user),
        csrfToken,
        expiresAt: session.expiresAt.toISOString(),
      })
    } catch (error) {
      next(error)
    }
  })

  router.post(
    '/logout',
    authenticated,
    requireCsrfToken,
    async (_request: Request, response: Response, next) => {
      try {
        const { session } = getAuthenticatedSession(response)
        await database.session.delete({
          where: { tokenHash: session.tokenHash },
        })
        clearSessionCookie(response)
        response.status(204).end()
      } catch (error) {
        next(error)
      }
    },
  )

  return router
}
