import { send } from 'process'

/*
 * User's Message
 * id, Sender's Id, receiver's id, createdDate, type(read/ write), nodeId
 */
export interface IMessage {
  messageId: string
  userId: string
  information: string
  nodeId: string
  dateCreated: Date
}

export type MessageFields = keyof IMessage

export function isIMessage(object: any): object is IMessage {
  const propsDefined: boolean = typeof (object as IMessage).messageId !== 'undefined'
  if (!propsDefined) {
    return false
  }
  return typeof (object as IMessage).nodeId === 'string' && typeof (object as IMessage).userId === 'string'
}

export function makeIMessage(
  messageId: string,
  userId: string,
  information: string,
  nodeId: string,
  dateCreated: Date
) {
  return {
    messageId: messageId,
    userId: userId,
    information: information,
    nodeId: nodeId,
    dateCreated: dateCreated,
  }
}
