// Import type definitions
import { Config } from '../types/config.js'
import { Result } from '../types/result.js'
import { ContentTypes } from '../types/content.types.js'

// Import Dependencies
import { IncomingMessage, ServerResponse } from 'http'
import { fileURLToPath } from 'url'
import pug from 'pug'
import fetch from 'node-fetch'
import path from 'path'
import fs from 'fs'
import FormData from 'form-data'

// Import Middlewares
import { authorize } from '../middlewares/authorization.js'
import { Results } from '../types/result.js'

// Global Scope
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const viewsPath = path.resolve(__dirname, '../../src/views')
const assetsPath = path.resolve(__dirname, '../../src/assets')

/*
 * GET ${installRoute}/install
 *
 * Render the installation page
 */

export async function GET(config: Config, req: IncomingMessage, res: ServerResponse) {
  if (req.url ? req.url.split('/').pop() !== 'install' : false) {
    const fileName = req.url?.split('/').pop()
    const fileExtension = fileName?.split('.').pop()
    const contentTypes: ContentTypes = {
      css: 'text/css',
      js: 'text/javascript',
      png: 'image/png',
      ico: 'image/x-icon',
      gif: 'image/gif',
      default: 'text/html'
    }

    if (typeof fileExtension !== 'undefined') {
      const contentType = contentTypes[fileExtension] || contentTypes.default
      const filePath = fileExtension === 'css' ? `${assetsPath}/css/${fileName}` : `${assetsPath}/images/${fileExtension}/${fileName}`

      if (fs.existsSync(path.resolve(filePath))) {
        res.writeHead(200, { 'Content-Type': contentType })
        res.end(fs.readFileSync(path.resolve(filePath)))
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('404 Not Found')
      }
    }

    return
  }

  const installPath = `${config.installRoute}/install`
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(
    pug.compileFile(viewsPath + '/login.pug')({
      action: installPath,
      hookUrl: config.ngrokUrl ? config.ngrokUrl : config.proxy
    })
  )
}

/*
 * POST ${installRoute}/install
 *
 * Handle the installation of a worker
 */
export async function POST(config: Config, env: string, req: IncomingMessage, res: ServerResponse) {
  if (!authorize(config, req, res)) return

  const proxyUrl = config.ngrokUrl || config.proxy
  const workers = Array.isArray(config.workers) ? config.workers : Object.values(config.workers)
  const promises = workers.map(async (worker) => {
    const { userName, token } = worker
    const form = new FormData()

    form.append('max_connections', config.maxConnections)
    form.append('drop_pending_updates', JSON.stringify(config.dropPendingUpdates))
    if (config.ipAddress) form.append('ip_address', config.ipAddress)
    if (config.allowedUpdates) form.append('allowed_updates', JSON.stringify(config.allowedUpdates))
    if (config.secretToken) form.append('secret_token', config.token)
    if (config.handShake && config.certificatePath) {
      form.append('certificate', fs.createReadStream(config.certificatePath))
    }
    form.append('url', `${proxyUrl}${config.installRoute}/${userName}`)

    try {
      const response = await fetch(`${config.apiUrl + token}/setWebhook`, {
        method: 'POST',
        headers: form.getHeaders(),
        body: form
      })
      const hook: Result = (await response.json()) as Result
      if (hook.ok && config.enableCommandLineLogs) {
        const getHandShake = await fetch(`${config.apiUrl + token}/getWebhookInfo`, { method: 'GET' })
        const result = await getHandShake.json()
        console.log(result)
        return { message: `Webhook installed for ${userName}!\n`, worker: userName, status: true }
      } else {
        if (config.enableCommandLineLogs) console.log(hook)
        return { message: `Webhook installation failed for ${userName}.\n`, worker: userName, status: false }
      }
    } catch (error) {
      if (config.enableCommandLineLogs) console.log(error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return { message: `Webhook installation failed for ${userName} due to error: ${errorMessage}\n`, worker: userName, status: false }
    }
  })

  const results = await Promise.all(promises)
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(
    pug.compileFile(viewsPath + '/webhook.pug')({
      title: 'Webhook Progress',
      results,
      env,
      installRoute: config.installRoute,
      hookUrl: proxyUrl
    })
  )
}

/*
 * POST ${installRoute}/uninstall/:worker
 *
 * Handle the uninstallation of a worker
 */

export async function DELETE(config: Config, userName: string, req: IncomingMessage, res: ServerResponse) {
  if (!authorize(config, req, res)) return

  if (!req.url) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'No worker specified' }))
    return
  }

  const userObject = Object.keys(config.workers).find((key) => config.workers[key].userName === userName)

  if (!userObject) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'No worker found' }))
    return
  }

  try {
    const response = await fetch(`${config.apiUrl + config.workers[userObject].token}/deleteWebhook`, {
      method: 'GET'
    })
    const hook = await response.json()
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(hook))
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.log(errorMessage)
  }
}
