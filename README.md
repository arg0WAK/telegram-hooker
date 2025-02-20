  <div align="center">
      <img src="https://arg0wak.github.io/gist/images/telegram-hooker/telegram.gif" width="92px">
  </div>
  <h1 align="center">telegram-hooker</h1>
  <p align="center">
      Service designed to handle multiple Telegram webhooks.
  </p>
  <p align="center">
      <img alt="Node 22.12.0" src="https://img.shields.io/badge/Node-22.12.0-nodedotjs?logo=nodedotjs&logoColor=white"/>
      <img alt="Typescript" src="https://img.shields.io/badge/TypeScript-blue?logo=typescript&logoColor=white"/>
      <img alt="Telegram" src="https://img.shields.io/badge/@arg0WAK-blue?logo=telegram&logoColor=white"/>
      <a target="_blank" href="https://github.com/arg0WAK/telegram-hooker/tree/master">
      <img alt="Github" src="https://img.shields.io/badge/Repository-gray?logo=Github&logoColor=white"/></a>
      <a target="_blank" href="https://github.com/arg0WAK/telegram-hooker/tree/master/examples">
      <img alt="Examples" src="https://img.shields.io/badge/Examples-pink?logo=project&logoColor=white"/></a>
      <a target="_blank" href="https://arg0wak.github.io/telegram-hooker/documentation/index.html">
      <img alt="Docs" src="https://img.shields.io/badge/Documentation-violet?logo=project&logoColor=dark"/></a><br/>
      <img alt="Express" src="https://img.shields.io/badge/Express-black?logo=Express&logoColor=white"/>
      <img alt="Fastify" src="https://img.shields.io/badge/Fastify-black?logo=Fastify&logoColor=white"/>      
      <img alt="Hapi" src="https://img.shields.io/badge/Hapi-black?logo=Hapi&logoColor=white"/>
      <img alt="Koa" src="https://img.shields.io/badge/Koa-black?logo=Koa&logoColor=white"/>
      <br/>
  </p>

## ⚙️ Getting Started

In this repo has a core HTTP structure that facilitates webhook management for Telegram bots. It is compatible with various frameworks (Express, Fastify, Koa, Hapi) and provides a set of tools you can use to manage and log your bots messages.

**You can manage all your workers in a single group, or each worker in their own private chat window.** If you planing to manage in a group, your main worker should have the permission to read the messages in the group **considering that all messages will be logged simultaneously on your server.**

## ✨ Features

- **Listens and processes webhook requests** from Telegram bots.

- Supported with examples using the **starter structure of each framework for easy implementation.**
- Optionally configurable **logging function is used to log all messages by default.**
- Core based **has message deletion and message sending functions** available for each worker.
- **Scalable bot configuration**
- **Seamless and optional NGROK integration** (_re-tunnelled on every run for every employee._)
- **Typescript** workspace **ready to build**.

## 🚀 Installation

This package is tested ESM only. In Node.js (version 18+), install with npm according to your framework:

**Core**

```bash
npm i @telegram-hooker/core
```

**Express**

```bash
npm i @telegram-hooker/express
```

**Fastify**

```bash
npm i @telegram-hooker/fastify
```

**Hapi**

```bash
npm i @telegram-hooker/hapi
```

**Koa**

```bash
npm i @telegram-hooker/koa
```

### Configure the Telegram Workers

Note that you must add at least one bot before you build the project. To get details about your main worker's telegram configuration, make a GET request with any tool to the following endpoint with the API key of the bot you created via BotFather.

```http
GET https://api.telegram.org/bot123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11/getMe
```

Response similar to the following response will be returned in result to the request sent.

```javascript
{
  "ok": true,
  "result": {
    "id": 0123456789, // This is a chatId
    "is_bot": true,
    "first_name": "BotName",
    "username": "NameBot",
    "can_join_groups": true,
    "can_read_all_group_messages": true,
    "supports_inline_queries": false,
    "can_connect_to_business": false,
    "has_main_web_app": false
  }
}
```

When you create a group, you can access the **groupId** key by default if there is **only one administrator in the group**. So remember to store the groupId key immediately after creating the group. This may become a need in your future developments.

To access superGroupId, **bot must have administrator privileges in group where is in**. If you meet these requirements, send a message to the group where the bot is located.

Then send a GET request to the following endpoint.

```http
GET https://api.telegram.org/bot123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11/getUpdates
```

Response similar to the following response will be returned in result to the request sent.

**If you don't get the expected answer, be sure to /start the bot via private chat.**

```javascript
{
  "ok": true,
  "result": [
   {
      "update_id": 0123456789,
      "message": {
        "message_id": 4883,
        "from": {
          "id": 0123456789, // Your chatId
          "is_bot": false,
          "first_name": "D",
          "username": "arg0WAK",
          "language_code": "en"
        },
        "chat": {
          "id": -1000123456789, // This is a superGroupId
          "title": "0x62",
          "type": "supergroup"
        },
        "date": 1735604231,
        "text": "Hello, Github!"
      }
    }
  ]
}
```

### Configure the createHook function<br/>

Implement a create hook function to your project. If you are using a Typescript environment, make sure you specify the appropriate type for the framework you depend on.

The following example reflects its use in a simple node-http environment. Refer to examples for other frameworks.

```javascript
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
      userName: 'MainBot', // Define your worker username
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
```

## Create Server

Use a createRoute middleware so that the Hook functionality can be attached.

```javascript
// Create node-http server
const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
  // Handle webhook requests
  worker.handleRequest(req, res) // Its will be work like a middleware

  /* Continue */
})
```

Determine the routes that your workers will communicate separately for each worker. This will allow you to manage messages from workers more effectively. In this case, the route expected by the API should be as follows. In a simple Node HTTP server, you need to access the body in the request object in order to correctly process the activities on Telegram. You can consider using a body parser in this context.

```javascript
  // Create worker route for tunneling (e.g. req.url === your-webhook-install-path/your-worker-username)
  else if (req.url === worker.config.installRoute + '/' + worker.config.workers.main_worker.userName) {
    // Process your bot actions (for req.body.message actions you need to parse the request body)
    console.log('Bot is active!')

    // Make sure you return a response with the code 200 at the end of the process. Otherwise, the Telegram API will send the same message again after about a minute.
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok' }))
  }
```

Use your optional routes as follows.

```javascript
// Your any routes
if (req.url === '/') {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/plain')
  res.end('This is a webhook server.')
}
```

If you want to assign a response in case 404 by default, specify this below the structure. This will only work with your optional routes other than installRoute.

```javascript
// Handle your 404 middleware
if (!res.headersSent && !req.handled) {
  res.statusCode = 404
  res.setHeader('Content-Type', 'text/plain')
  res.end('404 Not Found')
}
```

Install your hooks by accessing the url address you defined in installRoute via Browser. Bearer token you was defined before is required.

```http
GET https://<NGROK_OR_PROXY_URL>/webhook/specified-your-route
```

<img src="https://arg0wak.github.io/gist/images/telegram-hooker/zzv98-mc0dl.gif" width="100%" alt="Telegram Hooker" />

## 📃 License

Telegram Hooker is distributed under a BSL Licence which allows its unlimited non-commercial use. The code in this repository automatically becomes Open Source for commercial use (Apache 2.0 Licence) after 4 years. Some public repositories that complement this repository (examples, libraries, linkers, etc.) are licensed as Open Source under the MIT licence.

## 🔖 Contribution Guidelines

If you develop a library or linker that you want to integrate with this repo, I recommend that you first release it as a separate repo on the **MIT licence**.

For all concerns regarding basic **Telegram Hooker functionalities**, Issues are encouraged. For more information, feel free to contact me at my [Telegram address](https://t.me/arg0WAK) **if you do not receive a response to your Github cases.**
