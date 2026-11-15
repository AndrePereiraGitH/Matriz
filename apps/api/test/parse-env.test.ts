import { describe, expect, it } from 'vitest'
import { parseEnvironment } from '../src/config/parse-env.js'

describe('parseEnvironment', () => {
  it('uses the configured SQLite URL and port', () => {
    expect(
      parseEnvironment({
        DATABASE_URL: 'file:./dev.db',
        PORT: '3100',
      }),
    ).toEqual({
      databaseUrl: 'file:./dev.db',
      port: 3100,
    })
  })

  it('uses the default port when PORT is not set', () => {
    expect(
      parseEnvironment({
        DATABASE_URL: 'file:./dev.db',
      }).port,
    ).toBe(3000)
  })

  it('rejects a missing or non-SQLite database URL', () => {
    expect(() => parseEnvironment({})).toThrow(
      'DATABASE_URL must be a SQLite file URL (file:...)',
    )
    expect(() =>
      parseEnvironment({ DATABASE_URL: 'postgresql://localhost/matriz' }),
    ).toThrow('DATABASE_URL must be a SQLite file URL (file:...)')
    expect(() => parseEnvironment({ DATABASE_URL: 'file:' })).toThrow(
      'DATABASE_URL must be a SQLite file URL (file:...)',
    )
  })

  it('rejects invalid ports', () => {
    expect(() =>
      parseEnvironment({
        DATABASE_URL: 'file:./dev.db',
        PORT: '70000',
      }),
    ).toThrow('PORT must be an integer between 1 and 65535')
  })
})
