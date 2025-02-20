// Import type definitions
import type { Config } from '@telegram-hooker/core/src/types/config.js'
import type { Worker } from '@telegram-hooker/core/src/types/worker.js'

// Import Dependencies
import Hapi from '@hapi/hapi'
import { IncomingMessage, ServerResponse } from 'http'

// Import Core
import TelegramHookerCore from '@telegram-hooker/core'

interface ExtendedIncomingMessage extends IncomingMessage {
  body?: { [key: string]: string }
}

class TelegramHookerHapi {
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

  public createRoute = (server: Hapi.Server) => {
    server.route({
      method: 'GET',
      path: this.core.config.installRoute + '/{path}',
      handler: async (request, h) => {
        const rawRequest = request.raw.req as IncomingMessage
        const rawResponse = request.raw.res as ServerResponse
        await this.core.GET(rawRequest, rawResponse)
        return h.abandon
      }
    })

    server.route({
      method: 'POST',
      path: this.core.config.installRoute + '/install',
      handler: async (request, h) => {
        const body = request.payload as { [key: string]: string }
        const rawRequest = request.raw.req as ExtendedIncomingMessage
        const rawResponse = request.raw.res as ServerResponse
        rawRequest.body = body
        await this.core.POST(rawRequest, rawResponse)
        return h.abandon
      }
    })

    server.route({
      method: 'DELETE',
      path: this.core.config.installRoute + '/uninstall/{worker}',
      handler: async (request, h) => {
        const rawRequest = request.raw.req as IncomingMessage
        const rawResponse = request.raw.res as ServerResponse
        await this.core.DELETE(rawRequest, rawResponse)
        return h.abandon
      }
    })
  }
}

// Export the worker as an instance of the TelegramHooker class
export function createHook(config: Config): TelegramHookerHapi {
  const core = new TelegramHookerCore(config)
  return new TelegramHookerHapi(core)
}

export default TelegramHookerHapi
