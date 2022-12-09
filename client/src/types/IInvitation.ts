/*
 * User's invitation
 * id, Sender's Id, receiver's id, createdDate, type(read/ write), nodeId
 */
export interface IInvitation {
  inviteId: string
  rcverId: string
  rcverMail: string
  rcverName: string
  rcverUrl: string
  senderId: string
  senderMail: string
  senderName: string
  senderUrl: string
  createdDate: Date
  type: string
  nodeId: string
}

// inviteTypes returns a string array of the types available
export const inviteTypes: string[] = ['read', 'write']

export type InviteTypes = 'read' | 'write'

export type invitationFields = keyof IInvitation

export function isInvitation(object: any): object is IInvitation {
  const propsDefined: boolean = typeof (object as IInvitation).inviteId !== 'undefined'
  if (!propsDefined) {
    return false
  }
  return (
    inviteTypes.includes((object as IInvitation).type) &&
    typeof (object as IInvitation).inviteId === 'string'
  )
}

export function makeIInvitation(
  inviteId: string,
  rcverId: string,
  senderId: string,
  createdDate: Date,
  type: string,
  nodeId: string
) {
  return {
    inviteId: inviteId,
    rcverId: rcverId,
    senderId: senderId,
    createdDate: createdDate,
    type: type,
    nodeId: nodeId,
  }
}
