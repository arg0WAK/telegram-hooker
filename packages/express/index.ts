// Import type definitions
import type { Config } from '@telegram-hooker/core/src/types/config.js'
import type { Worker } from '@telegram-hooker/core/src/types/worker.js'
import type { Message } from '@telegram-hooker/core/src/types/message.js'

// Import Dependencies
import express, { Request, Response, Router } from 'express'

// Import Core
import TelegramHookerCore from '@telegram-hooker/core'

class TelegramHookerExpress {
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

  public async removeAllMessage(chat: { id: number }, logDirectory: string, logFile: string, token: string): Promise<void> {
    await this.core.removeAllMessage(chat, logDirectory, logFile)
  }

  /*
   * Sends a message using the Telegram API
   */

  public async sendMessage(chat: { id: number }, worker: Worker, message: string) {
    await this.core.sendMessage(chat, worker, message)
  }

  /*
   * Delete a message using Telegram API
   */

  public async deleteMessage(chat: { id: number }, logDirectory: string, logFile: string, message_id: number, token: string) {
    await this.core.deleteMessage(chat, logDirectory, logFile, message_id, token)
  }

  public createRoute = (): Router => {
    const router = express.Router()
    /*
     * Handles the installation frontend of a worker
     */

    router.get(this.core.config.installRoute + '/:path', async (req: Request, res: Response) => {
      await this.core.GET(req, res)
    })

    /*
     * Handles the installation of a worker
     */

    router.post(this.core.config.installRoute + '/install', async (req: Request, res: Response) => {
      await this.core.POST(req, res)
    })

    /*
     * Handles the uninstallation of a worker
     */

    router.delete(this.core.config.installRoute + '/uninstall/:worker', async (req: Request, res: Response) => {
      await this.core.DELETE(req, res)
    })

    return router
  }
}

// Export the worker as an instance of the TelegramHooker class
export function createHook(config: Config): TelegramHookerExpress {
  const core = new TelegramHookerCore(config)
  return new TelegramHookerExpress(core)
}

export default TelegramHookerExpress
