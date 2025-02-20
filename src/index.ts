// Import type definitions
import type { Config } from './types/config.js'
import type { Worker } from './types/worker.js'
import type { Route } from './types/route.js'

// Import Dependencies
import { IncomingMessage, ServerResponse } from 'http'
import { parse } from 'querystring'

// Import controllers
import { GET, POST, DELETE } from './controllers/webhook.js'

// Import helpers
import { welcomeMessage, sendMessage, deleteMessage, removeAllMessage } from './helpers/carrier.js'
import { jsonLogger } from './helpers/logger.js'

// Import Middlewares
import { ngserv } from './middlewares/ngrok.js'
import { Message } from './types/message.js'

declare module 'http' {
  interface IncomingMessage {
    handled?: boolean
  }
}
export default class TelegramHookerCore {
  public config: Config
  private routes: Route[]

  constructor(config: Config) {
    this.config = {
      ...config,
      apiUrl: 'https://api.telegram.org/bot',
      logsDirectory: config.logsDirectory ?? 'logs',
      enableCommandLineLogs: config.enableCommandLineLogs ?? true,
      dropPendingUpdates: config.dropPendingUpdates ?? true,
      maxConnections: config.maxConnections ?? 40,
      secretToken: config.secretToken === true ? config.token : config.secretToken
    }

    this.routes = []
    this.initWithAsync(this.config)
  }

  private async initWithAsync(config: Config) {
    await this.initializeNgrok(config)
    await this.initializeRoutes(config)
    await this.init(config)
  }

  /*
   * Initializes ngrok
   */

  private async initializeNgrok(config: Config) {
    if (!config.ngrokAuthToken && typeof config.proxy === 'boolean') {
      throw new Error('NGROK_AUTH_TOKEN is required')
    }

    if (config.proxy !== false) {
      return
    }

    try {
      const nghook = await ngserv(config)
      if (typeof nghook === 'string') {
        config.ngrokUrl = nghook
      } else {
        throw new Error('NGROK_URL is required')
      }
    } catch (error) {
      console.error(error)
      process.exit(1)
    }
  }

  /*
   * Initializes the routes for the worker
   */

  async initializeRoutes(config: Config) {
    this.routes.push(
      {
        method: 'GET',
        path: `${config.installRoute}/:path`,
        handler: this.GET.bind(this)
      },
      {
        method: 'POST',
        path: `${config.installRoute}/install`,
        handler: this.POST.bind(this)
      },
      {
        method: 'DELETE',
        path: `${config.installRoute}/uninstall/:worker`,
        handler: this.DELETE.bind(this)
      }
    )
  }

  /*
   * Initializes module
   */

  private async init(config: Config) {
    if (config.enableCommandLineLogs) {
      welcomeMessage(config)
    }
  }

  /*
   * Handles the installation frontend of a worker
   */

  public async GET(req: IncomingMessage, res: ServerResponse) {
    await GET(this.config, req, res)
  }

  /*
   * Handles the installation of a worker
   */

  public async POST(req: IncomingMessage, res: ServerResponse) {
    if ('body' in req) {
      // Handle framework body parsing
      const parsedBody = req.body as { [key: string]: string }
      const password = parsedBody.password
      const env = (req.headers.authorization = `Bearer ${password}`)
      await POST(this.config, env, req, res)
    } else {
      // No framework body parsing
      let body = ''
      req.on('data', (chunk) => {
        body += chunk.toString()
      })
      req.on('end', async () => {
        const parsedBody = parse(body) as { [key: string]: string }
        const password = parsedBody.password
        const env = (req.headers.authorization = `Bearer ${password}`)
        await POST(this.config, env, req, res)
      })
    }
  }

  /*
   * Handles the uninstallation of a worker
   */

  public async DELETE(req: IncomingMessage, res: ServerResponse) {
    const userName = req.url?.split('/').pop()

    if (userName) {
      await DELETE(this.config, userName, req, res)
      return
    }

    return
  }

  /*
   * Handles incoming HTTP requests
   */

  async handleRequest(req: IncomingMessage, res: ServerResponse) {
    const { method, url } = req
    const parsedUrl = new URL(url || '', `http://${req.headers.host}`)

    if (req.handled) {
      return
    }

    const route = this.routes.find((route) => {
      const routePath = route.path.replace(/:\w+/g, '([^/]+)')
      const regex = new RegExp(`^${routePath}$`)
      return route.method === method && regex.test(parsedUrl.pathname || '')
    })

    if (route) {
      req.handled = true
      route.handler(req, res)
      return
    }
  }

  /*
   * Logs a message to the optional logs directory
   */

  public async log(log: object, name: string) {
    await jsonLogger(this.config, log, name)
  }

  /*
   * Remove All Messages
   */

  public async removeAllMessage(chat: { id: number }, logDirectory: string, logFile: string, token: string): Promise<void> {
    await removeAllMessage(this.config, chat, logDirectory, logFile, token)
  }

  /*
   * Sends a message using the Telegram API
   */

  public async sendMessage(chat: { id: number }, worker: Worker, message: string) {
    await sendMessage(this.config, chat, worker, message)
  }

  /*
   * Delete a message using Telegram API
   */

  public async deleteMessage(chat: { id: number }, logDirectory: string, logFile: string, message_id: number, token: string) {
    await deleteMessage(this.config, chat, logDirectory, logFile, message_id, token)
  }
}

// Export the worker as an instance
export function createHook(config: Config): TelegramHookerCore {
  return new TelegramHookerCore(config)
}
