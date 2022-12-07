import { UserCollectionConnection } from './UserCollectionConnection'
import { IUser, IServiceResponse, failureServiceResponse, isIUser } from '../types'
import { MongoClient } from 'mongodb'
import { isIUserProperty, IUserProperty } from '../types/IUserProperty'

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

  /**
   * Method to update the user with the given userId.
   * @param userId the userId of the user
   * @param toUpdate an array of IUserProperty
   *
   * @returns IServiceResponse<IUser>
   */
  async updateUser(
    userId: string,
    toUpdate: IUserProperty[]
  ): Promise<IServiceResponse<IUser>> {
    const properties: any = {}
    for (let i = 0; i < toUpdate.length; i++) {
      if (!isIUserProperty(toUpdate[i])) {
        return failureServiceResponse('toUpdate parameters invalid')
      }
      const fieldName = toUpdate[i].fieldName
      const value = toUpdate[i].value
      properties[fieldName] = value
    }
    const userResponse = await this.userCollectionConnection.updateUser(
      userId,
      properties
    )
    if (!userResponse.success) {
      return failureServiceResponse('This user does not exist in the database!')
    }
    return userResponse
  }
}
