export interface AppEnvironment {
  port: number
  databaseUrl: string
  webOrigin: string
}

export function parseEnvironment(
  environment: NodeJS.ProcessEnv,
): AppEnvironment {
  const databaseUrl = environment.DATABASE_URL
  if (
    !databaseUrl?.startsWith('file:') ||
    databaseUrl.length === 'file:'.length
  ) {
    throw new Error('DATABASE_URL must be a SQLite file URL (file:...)')
  }

  const port = environment.PORT === undefined ? 3000 : Number(environment.PORT)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535')
  }

  const webOrigin = environment.WEB_ORIGIN ?? 'http://localhost:5173'
  let parsedWebOrigin: URL
  try {
    parsedWebOrigin = new URL(webOrigin)
  } catch {
    throw new Error('WEB_ORIGIN must be a valid HTTP(S) origin')
  }
  if (
    !['http:', 'https:'].includes(parsedWebOrigin.protocol) ||
    parsedWebOrigin.origin !== webOrigin
  ) {
    throw new Error('WEB_ORIGIN must be a valid HTTP(S) origin')
  }

  if (environment.NODE_ENV === 'production' && !environment.WEB_ORIGIN) {
    throw new Error('WEB_ORIGIN must be explicitly configured in production')
  }

  return { port, databaseUrl, webOrigin }
}
