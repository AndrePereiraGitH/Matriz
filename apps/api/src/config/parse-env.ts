export interface AppEnvironment {
  port: number
  databaseUrl: string
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

  return { port, databaseUrl }
}
