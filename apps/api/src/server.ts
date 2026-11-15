import { createApp } from './app.js'
import { env } from './config/env.js'
import { prisma } from './database/prisma.js'

async function startServer() {
  await prisma.$connect()
  const app = createApp(prisma)

  app.listen(env.port, '127.0.0.1', () => {
    console.log(`Matriz API listening on port ${env.port}`)
  })
}

startServer().catch((error: unknown) => {
  console.error('Failed to start Matriz API:', error)
  process.exitCode = 1
})
