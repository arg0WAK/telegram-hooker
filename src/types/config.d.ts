import type { Worker } from './worker.js'

interface BaseConfig {
  port?: number
  token: string
  enableCommandLineLogs?: boolean
  enableFileLogs: boolean
  logsDirectory: string
  installRoute: string
  readonly apiUrl?: string
  proxy: boolean | string
  ngrokAuthToken?: string
  ngrokUrl?: string
  groupId: string
  superGroupId: string
  workers: {
    [key: string]: Worker
  }
  handShake: boolean
  certificatePath?: string
  maxConnections?: number
  ipAddress?: string
  allowedUpdates?: string[]
  dropPendingUpdates?: boolean
  secretToken?: string | boolean
}

type superGroupIdRequired = BaseConfig & { groupId: string; superGroupId: string }
type superGroupIdOptional = Omit<BaseConfig, 'superGroupId'> & { superGroupId?: string }
type certRequired = BaseConfig & { handShake: true; certificatePath: string }
type certOptional = Omit<BaseConfig, 'certificatePath'> & { handShake: false }

export type Config = certRequired | certOptional
