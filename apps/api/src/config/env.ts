import 'dotenv/config'
import { parseEnvironment } from './parse-env.js'

export const env = parseEnvironment(process.env)
