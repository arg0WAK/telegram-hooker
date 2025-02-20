// Import type definitions
import type { Config } from '../types/config.js'

// Import Dependencies
import ngrok from 'ngrok'

// Import ANSI escape codes
import { colors } from '../utils/colors.js'

export async function ngserv(config: Config) {
  try {
    const nghook = await ngrok.connect({
      addr: config.port,
      authtoken: config.ngrokAuthToken
    })
    if (nghook) {
      return nghook
    }
  } catch (error) {
    if (config.enableCommandLineLogs) {
      console.log(`🚨${colors.error}Error: ${error}${colors.reset}🚨\n`)
    }
  }
}
