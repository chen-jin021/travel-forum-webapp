import {
  IUser,
  IServiceResponse,
  failureServiceResponse,
  successfulServiceResponse,
  isIUser,
} from '../types'
import { MongoClient } from 'mongodb'

/*
 * @param {MongoClient} client
 * @param {string} collectionName
 */

export class UserCollectionConnection {
  client: MongoClient
  collectionName: string

  constructor(mongoClient: MongoClient, collectionName?: string) {
    this.client = mongoClient
    this.collectionName = collectionName ?? 'users'
  }

  /**
   * Inserts a new user into the database
   * Returns successfulServiceResponse with IUser that was inserted as the payload
   *
   * @param {IUser} user
   * @return successfulServiceResponse<IUser>
   */

  async insertUser(user: IUser): Promise<IServiceResponse<IUser>> {
    if (!isIUser(user)) {
      return failureServiceResponse(
        'Failed to insert user due to improper input ' +
          'to userCollectionConnection.insertUser'
      )
    }
    const insertResponse = await this.client
      .db()
      .collection(this.collectionName)
      .insertOne(user)
    if (insertResponse.insertedCount) {
      return successfulServiceResponse(insertResponse.ops[0])
    }
    return failureServiceResponse(
      'Failed to insert user, insertCount: ' + insertResponse.insertedCount
    )
  }

  /**
   * Find user by userId
   *
   * @param {string} userId
   * @return successfulServiceResponse<IUser> on success
   *         failureServiceResponse on failure
   */
  async findUserById(userId: string): Promise<IServiceResponse<IUser>> {
    const findResponse = await this.client
      .db()
      .collection(this.collectionName)
      .findOne({ userId: userId })
    if (findResponse == null) {
      return failureServiceResponse('Failed to find user with this userId.')
    } else {
      return successfulServiceResponse(findResponse)
    }
  }

  /**
   * Clears the entire user collection in the database.
   *
   * @return successfulServiceResponse on success
   *         failureServiceResponse on failure
   */
  async clearUserCollection(): Promise<IServiceResponse<{}>> {
    const response = await this.client.db().collection(this.collectionName).deleteMany({})
    if (response.result.ok) {
      return successfulServiceResponse({})
    }
    return failureServiceResponse('Failed to clear user collection.')
  }

  /**
   * Updates user when given a userId and a set of properties to update.
   *
   * @param {string} userId
   * @param {Object} properties to update in MongoDB
   * @return successfulServiceResponse<Iuser> on success
   *         failureServiceResponse on failure
   */
  async updateUser(
    userId: string,
    updatedProperties: Object
  ): Promise<IServiceResponse<IUser>> {
    const updateResponse = await this.client
      .db()
      .collection(this.collectionName)
      .findOneAndUpdate(
        { userId: userId },
        { $set: updatedProperties },
        { returnDocument: 'after' }
      )
    if (updateResponse.ok && updateResponse.lastErrorObject.n) {
      return successfulServiceResponse(updateResponse.value)
    }
    return failureServiceResponse(
      'Failed to update user, lastErrorObject: ' +
        updateResponse.lastErrorObject.toString()
    )
  }
}
