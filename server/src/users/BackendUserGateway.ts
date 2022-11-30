import { UserCollectionConnection } from './UserCollectionConnection'
import { IUser, IServiceResponse, failureServiceResponse, isIUser } from '../types'
import { MongoClient } from 'mongodb'

export class BackendUserGateway {
  userCollectionConnection: UserCollectionConnection

  constructor(mongoClient: MongoClient, collectionName?: string) {
    this.userCollectionConnection = new UserCollectionConnection(
      mongoClient,
      collectionName ?? 'users'
    )
  }

  /**
   * Method to create a user and insert it into the database.
   *
   * @param userId - The userId of the user to be created.
   */
  async createUser(user: any): Promise<IServiceResponse<IUser>> {
    // check whether is valid User
    const isValidUser = isIUser(user)
    if (!isValidUser) {
      return failureServiceResponse('Not a valid user.')
    }
    // check whether already in database
    const userResponse = await this.userCollectionConnection.findUserById(user.userId)
    if (userResponse.success) {
      return failureServiceResponse('User with duplicate ID already exist in database.')
    }
    // insert user
    const insertUserResp = await this.userCollectionConnection.insertUser(user)
    return insertUserResp
  }

  /**
   * Method to retrieve user with a given userId.
   *
   * @param userId - The userId of the user to be retrieved.
   * @returns IServiceResponse<IUser>
   */
  async getUserById(userId: string): Promise<IServiceResponse<IUser>> {
    return this.userCollectionConnection.findUserById(userId)
  }

  /**
   * Method to delete all user nodes in the database.
   *
   * @returns IServiceResponse<{}>
   */
  async deleteAll(): Promise<IServiceResponse<{}>> {
    return await this.userCollectionConnection.clearUserCollection()
  }
}
