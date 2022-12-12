import { MongoClient } from 'mongodb'
import { failureServiceResponse, IServiceResponse, IMessage, isIMessage } from '../types'
import { MessageCollectionConnection } from './MessageCollectionConnection'

/**
 * BackendMessageGateway handles requests from messageRouter, and calls on methods
 * in MessageCollectionConnection to interact with the database. It contains
 * the complex logic to check whether the request is valid, before
 * modifying the database.
 */
export class BackendMessageGateway {
  messageCollectionConnection: MessageCollectionConnection

  constructor(mongoClient: MongoClient, collectionName?: string) {
    this.messageCollectionConnection = new MessageCollectionConnection(
      mongoClient,
      collectionName ?? 'messages'
    )
  }

  /**
   * Method to create an Message and insert it into the database.
   * Note, we do not check whether nodeId exists in the nodeCollection because
   * nodes and Messages are totally separate microservices - in your final project,
   * you may want to integrate both microservices together if you need more robustness.
   *
   * @param message - The Message to be created and inserted into the database.
   * @returns IServiceResponse<IMessage> where IMessage is the Message that has just been
   *          created
   */
  async createMessage(message: any): Promise<IServiceResponse<IMessage>> {
    // check whether is valid message
    const isValidMessage = isIMessage(message)
    if (!isValidMessage) {
      return failureServiceResponse('Not a valid Message.')
    }
    // check whether already in database
    const MessageResponse = await this.getMessageById(message.messageId)
    if (MessageResponse.success) {
      return failureServiceResponse(
        'Message with duplicate ID already exist in database.'
      )
    }
    // if everything check out, insert Message
    const insertResp = await this.messageCollectionConnection.insertMessage(message)
    return insertResp
  }

  /**
   * Method to retrieve Message with a given MessageId.
   *
   * @param MessageId - The MessageId of the Message to be retrieved.
   * @returns IServiceResponse<IMessage>
   */
  async getMessageById(MessageId: string): Promise<IServiceResponse<IMessage>> {
    return this.messageCollectionConnection.findMessageById(MessageId)
  }

  /**
   * Method to delete all Messages in the database.
   *
   * @returns IServiceResponse<{}>
   */
  async deleteAll(): Promise<IServiceResponse<{}>> {
    return await this.messageCollectionConnection.clearMessageCollection()
  }

  /**
   * Method to delete message with the given messageId.
   * Note, this does not delete any links associated with the deleted Message.
   * The frontend will call deleteLinks separately if needed.
   * Note, this method returns a success if the Message to delete does not exist.
   *
   * @param MessageId the MessageId of the Message
   * @returns Promise<IServiceResponse<{}>>
   */
  async deleteMessage(MessageId: string): Promise<IServiceResponse<{}>> {
    return this.messageCollectionConnection.deleteMessage(MessageId)
  }

  /**
   * Method that gets all messages attached to a given node.
   *
   * @param nodeId the nodeId of the node to get Messages for
   * @returns Promise<IServiceResponse<IMessage[]>>
   **/
  async getMessagesByNodeId(nodeId: string): Promise<IServiceResponse<IMessage[]>> {
    return this.messageCollectionConnection.findMessagesByNodeId(nodeId)
  }

  /**
   * Method that gets all messages
   * @returns Promise<IServiceResponse<IMessage[]>>
   */
  async fetchAllMessages(): Promise<IServiceResponse<IMessage[]>> {
    return this.messageCollectionConnection.fetchAllMessages()
  }
}
