export interface Message {
  message_id: number
  text: string
  from: {
    username: string
  }
  chat: {
    id: number
  }
}
