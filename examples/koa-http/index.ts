import Koa from 'koa'
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'
import TelegramHookerKoa, { createHook } from '../../packages/koa/index'

// Server configuration
const app = new Koa()
const router = new Router()
const port: number = 1337

// Koa parser middleware
app.use(bodyParser())

// Create a new worker
const worker: TelegramHookerKoa = createHook({
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

// Handle webhook requests
router.post(worker.config.installRoute + '/' + worker.config.workers.main_worker.userName, async (ctx) => {
  // Process your bot actions (for ctx.request.body.message you must use the Koa parser middlewares)
  const message = (ctx.request.body as { message: { text: string; chat: object } }).message
  const chat = message.chat
  const received = message.text

  if (received === '/start') {
    worker.sendMessage(chat, worker.config.workers.main_worker, 'Hello World!')
  }

  if (received === '/delete') {
    worker.deleteMessage(
      chat, worker.config.logsDirectory, 'messages.json', <MESSAGE_ID>, worker.config.workers.main_worker.token
    )
  }

  if (received === '/remove') {
    worker.removeAllMessage(chat, worker.config.logsDirectory 'messages.json', worker.config.workers.main_worker.token
    )
  }

  // Make sure you return a response with the code 200 at the end of the process. Otherwise, the Telegram API will send the same message again after about a minute.
  ctx.status = 200
  ctx.body = { status: 'ok' }
})

// Your any routes
router.get('/', async (ctx) => {
  ctx.body = 'This is a webhook server.'
})

// Handle your 404 middleware
app.use(async (ctx, next) => {
  await next()
  if (ctx.status === 404) {
    ctx.body = '404 Not Found'
  }
})

/* Handle webhook requests */
worker.createRoute(app) // Its will be work like a middleware
app.use(router.routes())
app.use(router.allowedMethods())

// Start server
app.listen(port, () => {
  console.log(`Server is working at: http://localhost:${port}`)
})
