// Import type definitions
import type { Config } from '@telegram-hooker/core/src/types/config.js'
import type { Worker } from '@telegram-hooker/core/src/types/worker.js'

// Import Dependencies
import Koa from 'koa'
import Router from 'koa-router'
import { IncomingMessage, ServerResponse } from 'http'

interface ExtendedIncomingMessage extends IncomingMessage {
  body?: { [key: string]: string }
}

// Import Core
import TelegramHookerCore from '@telegram-hooker/core'

class TelegramHookerKoa {
  private core: TelegramHookerCore

  constructor(core: TelegramHookerCore) {
    this.core = core
  }

  public get config(): Config {
    return this.core.config
  }

  /*
   * Logs a message to the optional logs directory
   */

  public async log(log: object, name: string) {
    await this.core.log(log, name)
  }

  /*
   * Remove All Messages
   */

  public async removeAllMessage(logDirectory: string, logFile: string): Promise<void> {
    await this.core.removeAllMessage(logDirectory, logFile)
  }

  /*
   * Sends a message using the Telegram API
   */

  public async sendMessage(worker: Worker, message: string) {
    await this.core.sendMessage(worker, message)
  }

  /*
   * Delete a message using Telegram API
   */

  public async deleteMessage(logDirectory: string, logFile: string, message_id: number, token: string) {
    await this.core.deleteMessage(logDirectory, logFile, message_id, token)
  }

  public createRoute = (app: Koa): Router => {
    const router = new Router()
    /*
     * Handles the installation frontend of a worker
     */

    router.get(this.core.config.installRoute + '/:path', async (ctx) => {
      const rawRequest = ctx.req as IncomingMessage
      const rawResponse = ctx.res as ServerResponse
      await this.core.GET(rawRequest, rawResponse)
    })

    /*
     * Handles the installation of a worker
     */

    router.post(this.core.config.installRoute + '/install', async (ctx) => {
      const body = ctx.request.body as { [key: string]: string }
      const rawRequest = ctx.req as ExtendedIncomingMessage
      const rawResponse = ctx.res as ServerResponse
      rawRequest.body = body
      await this.core.POST(rawRequest, rawResponse)
    })

    /*
     * Handles the uninstallation of a worker
     */

    router.delete(this.core.config.installRoute + '/uninstall/:worker', async (ctx) => {
      const rawRequest = ctx.req as IncomingMessage
      const rawResponse = ctx.res as ServerResponse
      await this.core.DELETE(rawRequest, rawResponse)
    })

    app.use(router.routes())
    app.use(router.allowedMethods())

    return router
  }
}

// Export the worker as an instance of the TelegramHooker class
export function createHook(config: Config): TelegramHookerKoa {
  const core = new TelegramHookerCore(config)
  return new TelegramHookerKoa(core)
}

export default TelegramHookerKoa
