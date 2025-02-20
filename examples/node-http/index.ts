import http, { IncomingMessage, ServerResponse } from 'http'
import TelegramHookerCore, { createHook } from '@telegram-hooker/core'

declare module 'http' {
  interface IncomingMessage {
    handled?: boolean
  }
}

// Server configuration
const hostname: string = 'localhost'
const port: number = 1337

// Create a new hook tree
const worker: TelegramHookerCore = createHook({
  port: port, // Define your server port
  proxy: false, // If you want to use a proxy, define your URL with a string type in the proxy key (e.g. 'https://proxy.arg0.dev')
  installRoute: '/webhook/specify-your-route', // Recommended usage starts with '/webhook' (e.g. '/webhook/arg0WAK')
  token: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u', // Define your bot token for Frontend API
  ngrokAuthToken: 'NGROK_AUTH_TOKEN', // Define your ngrok authtoken
  enableFileLogs: true, // If you want to save logs of messages received from Telegram
  enableCommandLineLogs: false, // If you don't want to see logs in the console
  logsDirectory: 'logs/arg0', // Define the directory for logs this worker
  groupId: '-1234567890', // Define your group id
  superGroupId: '-123456789124', // Define your supergroup id
  workers: {
    // Define your main worker (You must have at least one main worker.)
    main_worker: {
      userName: 'HookerBot', // Define your worker username
      token: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u', // Define your worker token
      chatId: '-123456789' // Define your chat id
    }
  },
  ipAddress: '142.250.189.238', // Define your server IP address (e.g. '142.250.189.238')
  handShake: true, // If you want to use a certificate, set it to true and define the path to the certificate
  certificatePath: 'path/to/certificate.pem', // If handShake is true you must define the path to the certificate
  maxConnections: 100, // Define the maximum number of connections
  dropPendingUpdates: true, // If you want to drop pending updates, set it to true (recommended)
  // Define the allowed updates (probably you need to only use 'message' and 'callback_query')
  allowedUpdates: [
    'message',
    'edited_message',
    'channel_post',
    'edited_channel_post',
    'inline_query',
    'chosen_inline_result',
    'callback_query',
    'shipping_query',
    'pre_checkout_query',
    'poll',
    'poll_answer',
    'my_chat_member',
    'chat_member'
  ],
  secretToken: true // If you want to use a secret token equal Bearer token, set it to true. Otherwise, you can define different token
})

// Create node-http server
const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
  // Handle webhook requests
  worker.handleRequest(req, res) // Its will be work like a middleware

  // Your any routes
  if (req.url === '/') {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    res.end('This is a webhook server.')
  }

  // Create worker route for tunneling (e.g. req.url === your-webhook-install-path/your-worker-username)
  else if (req.url === worker.config.installRoute + '/' + worker.config.workers.main_worker.userName) {
    // Process your bot actions (for req.body.message actions you need to parse the request body)
    console.log('Bot is active!')

    // Make sure you return a response with the code 200 at the end of the process. Otherwise, the Telegram API will send the same message again after about a minute.
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok' }))
  }

  // Handle your 404 middleware
  if (!res.headersSent && !req.handled) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'text/plain')
    res.end('404 Not Found')
  }
})

// Start server
server.listen(port, hostname, () => {
  console.log(`Server is working at: http://${hostname}:${port}/`)
})
