// Core module tests
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { createHook } from '../src/index'
import type { IncomingMessage, ServerResponse } from 'http'

const dummyConfig = {
  token: 'dummy-token',
  logsDirectory: 'dummy-logs',
  enableCommandLineLogs: false,
  dropPendingUpdates: false,
  maxConnections: 100,
  installRoute: '/webhook',
  proxy: false,
  ngrokAuthToken: 'dummy-ngrok',
  groupId: 'dummy-group',
  superGroupId: 'dummy-supergroup',
  workers: {},
  enableFileLogs: false,
  handShake: false as const
}

describe('TelegramHookerCore', () => {
  let hook: ReturnType<typeof createHook>

  beforeAll(() => {
    hook = createHook(dummyConfig)
  })

  it('should initialize with default values', () => {
    expect(hook.config.apiUrl).toBe('https://api.telegram.org/bot')
    expect(hook.config.logsDirectory).toBe('dummy-logs')
    expect(hook.config.maxConnections).toBe(100)
  })

  it('should not respond when no route matches', async () => {
    const req = {
      url: '/nonexisting',
      headers: { host: 'localhost' },
      handled: false,
      on: vi.fn()
    } as unknown as IncomingMessage

    const res = {
      writeHead: vi.fn(),
      end: vi.fn()
    } as unknown as ServerResponse

    await hook.handleRequest(req, res)

    expect(res.writeHead).not.toHaveBeenCalled()
    expect(res.end).not.toHaveBeenCalled()
  })
})
