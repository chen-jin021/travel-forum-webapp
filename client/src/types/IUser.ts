/*
 * User's account
 * With unique id, email address, name, encoded password and avatar img address.
 */
export interface IUser {
  userId: string
  mail: string
  userName: string
  avatar: string // avatar address
}

export type UserType = 'user'

export function isIUser(object: any): object is IUser {
  const propsDefined: boolean = typeof (object as IUser).userId !== 'undefined'
  if (!propsDefined) {
    return false
  }
  return typeof (object as IUser).userId === 'string'
}

export function makeIUser(
  userId: string,
  mail: string,
  userName: string,
  avatar: string
) {
  return {
    userId: userId,
    mail: mail,
    userName: userName,
    avatar: avatar,
  }
}
