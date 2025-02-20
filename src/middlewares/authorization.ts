// Import type definitions
import { Config } from '../types/config.js'

// Import Dependencies
import { IncomingMessage, ServerResponse } from 'http'
import { fileURLToPath } from 'url'
import pug from 'pug'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const viewsPath = path.resolve(__dirname, '../../src/views')

export const authorize = (config: Config, req: IncomingMessage, res: ServerResponse) => {
  const authHeader = req.headers.authorization
  const token = `Bearer ${config.token}`
  if (authHeader !== token) {
    const installPath = `${config.installRoute}/install`

    res.writeHead(401, { 'Content-Type': 'text/html' })
    res.end(
      pug.compileFile(viewsPath + '/login.pug')({
        title: 'Unauthorized',
        hookUrl: config.ngrokUrl ? config.ngrokUrl : config.proxy,
        action: installPath,
        error: true
      })
    )
    return false
  }
  return true
}
