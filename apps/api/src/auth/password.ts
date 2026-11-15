import { randomBytes, scrypt, scryptSync, timingSafeEqual } from 'node:crypto'

const KEY_LENGTH = 64
const DUMMY_PASSWORD_HASH = hashPassword(randomBytes(32).toString('hex'))

export function hashPassword(password: string): string {
  const salt = randomBytes(16)
  const derivedKey = scryptSync(password, salt, KEY_LENGTH, {
    maxmem: 64 * 1024 * 1024,
  })

  return `scrypt$${salt.toString('hex')}$${derivedKey.toString('hex')}`
}

function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      KEY_LENGTH,
      { maxmem: 64 * 1024 * 1024 },
      (error, derivedKey) => {
        if (error) {
          reject(error)
          return
        }

        resolve(derivedKey)
      },
    )
  })
}

export async function verifyPassword(
  password: string,
  passwordHash: string | null,
): Promise<boolean> {
  const candidateHash = passwordHash ?? DUMMY_PASSWORD_HASH
  const [algorithm, saltHex, expectedHex] = candidateHash.split('$')

  if (
    algorithm !== 'scrypt' ||
    !saltHex ||
    !expectedHex ||
    !/^[a-f0-9]{32}$/i.test(saltHex) ||
    !/^[a-f0-9]{128}$/i.test(expectedHex)
  ) {
    await deriveKey(password, Buffer.alloc(16))
    return false
  }

  const actual = await deriveKey(password, Buffer.from(saltHex, 'hex'))
  const expected = Buffer.from(expectedHex, 'hex')
  const matches = timingSafeEqual(actual, expected)

  return passwordHash !== null && matches
}
