// Import type definitions
import type { Config } from '../types/config.js'
import type { Worker } from '../types/worker.js'
import type { Message } from '../types/message.js'
import type { Result } from '../types/result.js'

// Import Dependencies
import fs from 'fs/promises'
import fetch from 'node-fetch'
import path from 'path'

// Import helpers
import { jsonLogger } from '../helpers/logger.js'

// Import ANSI escape codes
import { colors } from '../utils/colors.js'

let hasASCII = false

/*
 * Welcome message
 */

export function welcomeMessage(config: Config): void {
  if (!hasASCII) {
    console.log(`${colors.debug}
⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢀⡴⣾⣻⢿⣽⣻⣽⣻⢿⣻⣷⣄⡀⠀⠀⠀⠀
⠀⠀⢀⣴⣿⣻⢷⣻⣟⣾⡽⣞⣯⣿⣳⢯⣟⡿⣦⡀⠀⠀
⠀⣠⣿⣻⢾⣽⣻⢷⣻⡾⣽⣟⡷⣯⣟⠯⣿⡽⣯⣷⣆⠀
⢀⣿⣳⣯⢿⡾⣽⣻⢷⣻⠟⠞⠉⠁⠀⠀⣼⣻⢷⣻⢾⡀
⢸⣷⣻⢾⣯⠿⠝⠋⠁⠀⢀⣠⠖⠁⠀⢠⡿⣽⣻⣽⢯⡇
⢸⣷⣻⣟⡾⣿⢶⣦⣤⣶⡏⠁⠀⠀⠀⢰⡿⣯⢷⣯⢿⡇
⠈⣷⣻⣞⡿⣽⣻⣞⡷⣯⢿⣶⣀⠀⠀⣼⢿⣽⣻⢾⣯⠁
⠀⠘⢷⣻⣽⣟⡷⣯⢿⣽⣻⣞⣿⣻⣞⣯⡿⣾⣽⡻⠎⠀
⠀⠀⠈⠻⣳⣯⢿⡽⣯⡷⣿⡽⣞⣷⢯⣷⣟⡷⠏⠁⠀⠀
⠀⠀⠀⠀⠈⠙⠯⣿⣳⢿⣳⢿⣻⢾⣻⡷⠋⠁⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠉⠉⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀
${colors.reset}`)
    console.log(`🔵 ${colors.reset}Welcome the Telegram Hooker v1.0.0`)
    hasASCII = true
  }
  console.log(`🚀 ${colors.debug}Ready for install at ${colors.warning}http://localhost:${config.port}${config.installRoute}/install${colors.reset}`)
  if (typeof config.proxy !== 'string') {
    console.log(`🔗 ${colors.debug}NGROK URL: ${config.ngrokUrl}${colors.reset}`)
    console.log(`🪝  ${colors.debug}WEBHOOK URL: ${colors.info}${config.ngrokUrl}/webhook${colors.reset}\n`)
  } else {
    console.log(`🪝  ${colors.debug}WEBHOOK URL: ${colors.info}${config.proxy}/webhook${colors.reset}\n`)
  }
}

/*
 * Send message
 */

export async function sendMessage(config: Config, chat: { id: number }, worker: Worker, message: string): Promise<Result | void> {
  const receivedFrom = chat.id
  const matchedWorker = Object.values(config.workers).find((w) => w.userName === worker.userName)
  const token = matchedWorker?.token
  if (!config.apiUrl) {
    throw new Error('API URL is undefined!')
  }
  try {
    const response = await fetch(`${config.apiUrl}${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: receivedFrom,
        text: message
      })
    })
    const sendedMessage: Result = (await response.json()) as Result

    if (sendedMessage.ok && config.enableFileLogs) {
      await jsonLogger(config, sendedMessage.result, 'messages')
      return sendedMessage
    }
  } catch (error) {
    handleError(error, config)
  }
}

/*
 * Read message
 */

export async function readMessagesFile(logFile: string): Promise<Message[]> {
  try {
    const fileContent = await fs.readFile(logFile, 'utf-8')
    return JSON.parse(fileContent)
  } catch {
    return []
  }
}

/*
 * Log file checker
 */

export async function getLogFilePath(logsDirectory: string, logFile: string): Promise<string> {
  if (logFile && path.extname(logFile) === '.json') {
    logFile = logFile.slice(0, -5)
  }

  if (!logFile || !path.extname(logFile)) {
    logFile = logFile ? `${logFile}.json` : 'messages.json'
  } else {
    throw new Error('Invalid log file extension!')
  }

  return path.join(`./${logsDirectory}/${logFile}`)
}

/*
 * Delete message
 */

export async function deleteMessage(config: Config, chat: { id: number }, logsDirectory: string, logFile: string, message_id: number, token: string) {
  const apiUrl = `${config.apiUrl}${token}/deleteMessage?chat_id=${chat.id}&message_id=${message_id}`
  logsDirectory = config.logsDirectory || logsDirectory
  const processPath = await getLogFilePath(logsDirectory, logFile)
  let messages = await readMessagesFile(processPath)

  if (!messages.length && config.enableCommandLineLogs) {
    console.log('No messages to remove')
    return
  }

  try {
    const result = await fetchDeleteMessage(apiUrl)
    if (!result.error_code) {
      messages = messages.filter((m) => m.message_id !== message_id)
      await fs.writeFile(processPath, JSON.stringify(messages))
      config.enableCommandLineLogs && console.log('Message removed:', message_id)
      return true
    } else {
      logError(result, apiUrl, config)
    }
    return false
  } catch (error) {
    handleError(error, config)
    return false
  }
}

/*
 * Fetch delete message API
 */

async function fetchDeleteMessage(apiUrl: string): Promise<Result> {
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
  return (await response.json()) as Result
}

/*
 * Log error
 */

function logError(result: Result, apiUrl: string, config: Config) {
  if (config.enableCommandLineLogs) {
    console.log('Error:', result)
    console.log(apiUrl)
  }
}

/*
 * Remove all message
 */

export async function removeAllMessage(config: Config, chat: { id: number }, logsDirectory: string, logFile: string, token: string) {
  logsDirectory = config.logsDirectory || logsDirectory
  const processPath = await getLogFilePath(logsDirectory, logFile)
  const messages = await readMessagesFile(processPath)

  if (!messages.length && config.enableCommandLineLogs) {
    console.log('No messages to remove')
    return
  }

  const getEqualFromIdtoMessage = messages.filter((m) => m.chat.id === chat.id)

  for (const message of getEqualFromIdtoMessage) {
    await deleteMessage(config, chat, logsDirectory, logFile, message.message_id, token)
  }
}

/*
 * Handle error
 */

function handleError(error: unknown, config: Config): void {
  if (config.enableCommandLineLogs) {
    console.error('Error:', error)
  }
}
