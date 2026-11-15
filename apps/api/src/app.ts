import express from 'express'
import type { PrismaClient } from '@prisma/client'
import { createAuthRouter } from './auth/routes.js'
import { prisma } from './database/prisma.js'
import { createDomainRouter } from './domain/routes.js'
import {
  apiErrorMiddleware,
  corsAndOriginMiddleware,
} from './http/middleware.js'

export function createApp(database: PrismaClient = prisma) {
  const app = express()

  app.use(corsAndOriginMiddleware)
  app.use(express.json({ limit: '16kb' }))
  app.use('/api/v1/auth', createAuthRouter(database))
  app.use('/api/v1', createDomainRouter(database))
  app.use(apiErrorMiddleware)

  return app
}
