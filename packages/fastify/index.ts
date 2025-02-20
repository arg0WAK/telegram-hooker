// Import type definitions
import type { Config } from '@telegram-hooker/core/src/types/config.js'
import type { Worker } from '@telegram-hooker/core/src/types/worker.js'

// Import Dependencies
import Fastify, { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginAsync } from 'fastify'
import { IncomingMessage, ServerResponse } from 'http'

// Import Core
import TelegramHookerCore from '@telegram-hooker/core'

interface ExtendedIncomingMessage extends IncomingMessage {
  body: { [key: string]: string }
}

class TelegramHookerFastify {
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

  public createRoute = async (fastify: FastifyInstance): Promise<void> => {
    /*
     * Handles the installation frontend of a worker
     */

    fastify.get(this.core.config.installRoute + '/:path', async (request: FastifyRequest, reply: FastifyReply) => {
      const rawRequest = request.raw as IncomingMessage
      const rawResponse = reply.raw as ServerResponse
      await this.core.GET(rawRequest, rawResponse)
    })

    /*
     * Handles the installation of a worker
     */

    fastify.post(this.core.config.installRoute + '/install', async (request: FastifyRequest, reply: FastifyReply) => {
      const body = request.body as { [key: string]: string }
      const rawRequest = request.raw as ExtendedIncomingMessage
      const rawResponse = reply.raw as ServerResponse
      rawRequest.body = body
      await this.core.POST(rawRequest, rawResponse)
    })

    /*
     * Handles the uninstallation of a worker
     */

    fastify.delete(this.core.config.installRoute + '/uninstall/:worker', async (request: FastifyRequest, reply: FastifyReply) => {
      const rawRequest = request.raw as IncomingMessage
      const rawResponse = reply.raw as ServerResponse
      await this.core.DELETE(rawRequest, rawResponse)
    })
  }
}

// Export the worker as an instance of the TelegramHooker class
export function createHook(config: Config): TelegramHookerFastify {
  const core = new TelegramHookerCore(config)
  return new TelegramHookerFastify(core)
}

export default TelegramHookerFastify
