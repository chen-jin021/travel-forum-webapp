import {
  IServiceResponse,
  failureServiceResponse,
  successfulServiceResponse,
  IMessage,
  isIMessage,
  Extent,
} from '../types'
import { MongoClient } from 'mongodb'

/**
 * MessageCollectionConnection acts as an in-between communicator between
 * the MongoDB database and BackendMessageGateway. MessageCollectionConnection
 * defines methods that interact directly with MongoDB. That said,
 * it does not include any of the complex logic that BackendMessageGateway has.
 * Note, currently, BackendMessageGateway is very simple. But as we add more complexity
 * to our system, we will implement that logic in BackendMessageGateway.
 *
 * @param {MongoClient} client
 * @param {string} collectionName
 */
export class MessageCollectionConnection {
  client: MongoClient
  collectionName: string

  constructor(mongoClient: MongoClient, collectionName?: string) {
    this.client = mongoClient
    this.collectionName = collectionName ?? 'Messages'
  }

  /**
   * Inserts a new Message into the database
   * Returns successfulServiceResponse with IMessage that was inserted as the payload
   *
   *
   * @param {IMessage} message
   * @return successfulServiceResponse<IMessage> if successful insertion
   *         failureServiceResponse if failed to insert
   */
  async insertMessage(message: IMessage): Promise<IServiceResponse<IMessage>> {
    if (!isIMessage(message)) {
      return failureServiceResponse(
        'Failed to insert Message due to improper input ' +
          'to MessageCollectionConnection.insertMessage'
      )
    }
    const insertResponse = await this.client
      .db()
      .collection(this.collectionName)
      .insertOne(message)
    if (insertResponse.insertedCount) {
      return successfulServiceResponse(insertResponse.ops[0])
    }
    return failureServiceResponse(
      'Failed to insert Message, insertCount: ' + insertResponse.insertedCount
    )
  }

  /**
   * Clears the entire Message collection in the database.
   *
   *
   * @return successfulServiceResponse<{}> on success
   *         failureServiceResponse on failure
   */
  async clearMessageCollection(): Promise<IServiceResponse<{}>> {
    const response = await this.client.db().collection(this.collectionName).deleteMany({})
    if (response.result.ok) {
      return successfulServiceResponse({})
    }
    return failureServiceResponse('Failed to clear Message collection.')
  }

  /**
   * Finds message by its unique messageId
   *
   *
   * @param {string} messageId
   * @return successfulServiceResponse<IMessage> on success
   *         failureServiceResponse on failure
   */
  async findMessageById(messageId: string): Promise<IServiceResponse<IMessage>> {
    const findResponse = await this.client
      .db()
      .collection(this.collectionName)
      .findOne({ MessageId: messageId })
    if (findResponse == null) {
      return failureServiceResponse('Failed to find message with this messageId.')
    } else {
      return successfulServiceResponse(findResponse)
    }
  }
  /**
   * Finds messages by nodeId
   *
   *
   * @param {string} nodeId
   * @return successfulServiceResponse<IMessage> on success
   *         failureServiceResponse on failure
   */
  async findMessagesByNodeId(nodeId: string): Promise<IServiceResponse<IMessage[]>> {
    const res: IMessage[] = []
    const findResponse = await this.client
      .db()
      .collection(this.collectionName)
      .find({ nodeId: nodeId })
      .forEach((item) => {
        res.push(item)
      })
    return successfulServiceResponse(res)
  }

  /**
   * Deletes Message with the given MessageId.
   *
   *
   * @param {string} messageId
   * @return successfulServiceResponse<IMessage> on success
   *         failureServiceResponse on failure
   */
  async deleteMessage(messageId: string): Promise<IServiceResponse<{}>> {
    const collection = await this.client.db().collection(this.collectionName)
    const deleteResponse = await collection.deleteOne({ MessageId: messageId })
    if (deleteResponse.result.ok) {
      return successfulServiceResponse({})
    }
    return failureServiceResponse('Failed to delete')
  }

  /**
   * Fetch all messages.
   *
   *
   * @param {string} messageId
   * @return successfulServiceResponse<IMessage> on success
   *         failureServiceResponse on failure
   */
  async fetchAllMessages(): Promise<IServiceResponse<IMessage[]>> {
    const findResponse = await this.client.db().collection(this.collectionName).find()
    if (findResponse == null) {
      return failureServiceResponse('Failed to fetch all messages.')
    } else {
      return successfulServiceResponse(findResponse)
    }
  }
}
