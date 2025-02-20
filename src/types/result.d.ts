import type { Send } from './send.js'
import type { Remove } from './remove.js'
import type { Hook } from './hook.js'
import type { HookNFO } from './hooknfo.js'

export interface Result {
  ok: boolean
  error_code?: number
  description?: string
  result: Send | Remove | Hook | HookNFO
}

export interface Results {
  message: string[]
  worker: string
  status: boolean
}
