import type { ErrorRequestHandler, RequestHandler } from 'express'
import { env } from '../config/env.js'

export const corsAndOriginMiddleware: RequestHandler = (
  request,
  response,
  next,
) => {
  const origin = request.header('origin')
  if (origin && origin !== env.webOrigin) {
    response.status(403).json({
      code: 'ORIGIN_NOT_ALLOWED',
      message: 'A origem deste pedido não está autorizada.',
    })
    return
  }

  response.vary('Origin')
  if (origin === env.webOrigin) {
    response.setHeader('Access-Control-Allow-Origin', env.webOrigin)
    response.setHeader('Access-Control-Allow-Credentials', 'true')
  }

  if (request.method === 'OPTIONS') {
    response.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    )
    response.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, X-CSRF-Token',
    )
    response.status(204).end()
    return
  }

  next()
}

interface HttpError extends Error {
  status?: number
  type?: string
}

export const apiErrorMiddleware: ErrorRequestHandler = (
  error: HttpError,
  _request,
  response,
  _next,
) => {
  if (error.type === 'entity.parse.failed') {
    response.status(400).json({
      code: 'BAD_REQUEST',
      message: 'O corpo do pedido não contém JSON válido.',
    })
    return
  }

  if (error.type === 'entity.too.large') {
    response.status(413).json({
      code: 'PAYLOAD_TOO_LARGE',
      message: 'O corpo do pedido excede o tamanho permitido.',
    })
    return
  }

  console.error('Unhandled API error:', error)
  response.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Ocorreu um erro interno. Tente novamente.',
  })
}
