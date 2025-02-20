import { IncomingMessage, ServerResponse } from 'http'

export interface Route {
  method: string
  path: string
  handler: (req: IncomingMessage, res: ServerResponse) => Promise<void>
}
