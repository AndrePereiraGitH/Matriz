import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import type { Request, RequestHandler } from 'express'
import type { PrismaClient, Session, User } from '@prisma/client'

export const SESSION_COOKIE_NAME = 'matriz_session'
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000

export interface AuthenticatedSession {
  session: Session
  user: Pick<User, 'id' | 'name' | 'email'>
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function getCookieValues(request: Request, name: string): string[] {
  const cookieHeader = request.header('cookie')
  if (!cookieHeader) {
    return []
  }

  return cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .filter((cookie) => cookie.startsWith(`${name}=`))
    .map((cookie) => cookie.slice(name.length + 1))
}

export function readSessionToken(request: Request): string | null {
  const values = getCookieValues(request, SESSION_COOKIE_NAME)
  if (
    values.length !== 1 ||
    !/^[A-Za-z0-9_-]{43}$/.test(values[0] ?? '')
  ) {
    return null
  }

  return values[0] ?? null
}

export function hashSessionToken(token: string): string {
  return hashToken(token)
}

export function createOpaqueToken(): string {
  return randomBytes(32).toString('base64url')
}

export function setSessionCookie(
  response: Parameters<RequestHandler>[1],
  token: string,
): void {
  response.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: SESSION_TTL_MS,
    path: '/api/v1',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}

export function clearSessionCookie(
  response: Parameters<RequestHandler>[1],
): void {
  response.cookie(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/api/v1',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}

export const requireSession =
  (database: PrismaClient): RequestHandler =>
  async (request, response, next) => {
    try {
      const token = readSessionToken(request)
      if (!token) {
        response.status(401).json({
          code: 'UNAUTHENTICATED',
          message: 'Inicie sessão para continuar.',
        })
        return
      }

      const session = await database.session.findUnique({
        where: { tokenHash: hashToken(token) },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      if (!session) {
        clearSessionCookie(response)
        response.status(401).json({
          code: 'SESSION_INVALID',
          message: 'A sessão já não é válida. Inicie sessão novamente.',
        })
        return
      }

      if (session.expiresAt.getTime() <= Date.now()) {
        await database.session.delete({
          where: { tokenHash: session.tokenHash },
        })
        clearSessionCookie(response)
        response.status(401).json({
          code: 'SESSION_EXPIRED',
          message: 'A sessão expirou. Inicie sessão novamente.',
        })
        return
      }

      response.locals.authenticatedSession = {
        session,
        user: session.user,
      } satisfies AuthenticatedSession
      next()
    } catch (error) {
      next(error)
    }
  }

export const requireCsrfToken: RequestHandler = (request, response, next) => {
  const authenticatedSession = response.locals
    .authenticatedSession as AuthenticatedSession | undefined
  const csrfToken = request.header('x-csrf-token')

  if (!authenticatedSession || !csrfToken) {
    response.status(403).json({
      code: 'CSRF_VALIDATION_FAILED',
      message: 'A validação de segurança falhou. Atualize a sessão e tente novamente.',
    })
    return
  }

  const expected = Buffer.from(authenticatedSession.session.csrfTokenHash, 'hex')
  const actual = Buffer.from(hashToken(csrfToken), 'hex')
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    response.status(403).json({
      code: 'CSRF_VALIDATION_FAILED',
      message: 'A validação de segurança falhou. Atualize a sessão e tente novamente.',
    })
    return
  }

  next()
}

export function getAuthenticatedSession(
  response: Parameters<RequestHandler>[1],
): AuthenticatedSession {
  const session = response.locals.authenticatedSession as
    | AuthenticatedSession
    | undefined

  if (!session) {
    throw new Error('Authenticated session middleware was not applied')
  }

  return session
}
