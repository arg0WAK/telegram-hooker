// Import type definitions
import { Config } from '../types/config.js'
import { getLogFilePath } from './carrier.js'

// Import Dependencies
import fs from 'fs/promises'

export async function jsonLogger(config: Config, log: object, name: string): Promise<void> {
  const directory = config.logsDirectory || './logs'
  const processPath = await getLogFilePath(directory, name)
  try {
    await fs.mkdir(directory, { recursive: true })
    try {
      await fs.access(processPath)
    } catch {
      if (config.enableCommandLineLogs) {
        console.log('filePath not found, creating new filePath...')
      }
      await fs.writeFile(processPath, '[]')
    }
    const data = await fs.readFile(processPath, 'utf-8').catch(() => '[]')
    const json = JSON.parse(data).concat(log)
    await fs.writeFile(processPath, JSON.stringify(json))
  } catch (error) {
    if (config.enableCommandLineLogs) {
      console.error('Error handling filePath:', error)
    }
  }
}
