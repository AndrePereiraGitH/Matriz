import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'
import { parseEnvironment } from './parse-env.js'

config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) })
config()

export const env = parseEnvironment(process.env)
