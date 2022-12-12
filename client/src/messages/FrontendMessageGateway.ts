import { failureServiceResponse, IMessage, IServiceResponse } from '../types'
import { endpoint, get, post, remove } from '../global'

/** In development mode (locally) the server is at localhost:5000*/
const baseEndpoint = endpoint

/** This is the path to the message microservice */
const servicePath = 'message/'

/**
 * [FRONTEND Message GATEWAY]
 * FrontendMessageGateway handles HTTP requests to the host, which is located on the
 * server. This FrontendMessageGateway object uses the baseEndpoint, and additional
 * server information to access the requested information.
 *
 * These methods use the get, post, put and remove http requests from request.ts
 * helper methods to make requests to the server.
 */
export const FrontendMessageGateway = {
  createMessage: async (message: IMessage): Promise<IServiceResponse<IMessage>> => {
    try {
      return await post<IServiceResponse<IMessage>>(
        baseEndpoint + servicePath + 'create',
        {
          message: message,
        }
      )
    } catch (exception) {
      return failureServiceResponse('[createMessage] Unable to access backend')
    }
  },

  deleteMessage: async (messageId: string): Promise<IServiceResponse<{}>> => {
    try {
      return await remove<IServiceResponse<IMessage>>(
        baseEndpoint + servicePath + messageId
      )
    } catch (exception) {
      return failureServiceResponse('[deleteMessage] Unable to access backend')
    }
  },

  getMessage: async (messageId: string): Promise<IServiceResponse<IMessage>> => {
    try {
      return await get<IServiceResponse<IMessage>>(baseEndpoint + servicePath + messageId)
    } catch (exception) {
      return failureServiceResponse('[getMessage] Unable to access backend')
    }
  },

  getMessagesByNodeId: async (nodeId: string): Promise<IServiceResponse<IMessage[]>> => {
    try {
      return await get<IServiceResponse<IMessage[]>>(
        baseEndpoint + servicePath + 'getByNodeId/' + nodeId
      )
    } catch (exception) {
      return failureServiceResponse('[getMessagesByNodeId] Unable to access backend')
    }
  },

  fetchAllMessages: async (): Promise<IServiceResponse<IMessage[]>> => {
    try {
      return await get<IServiceResponse<IMessage[]>>(
        baseEndpoint + servicePath + '/getAllMsgs'
      )
    } catch (exception) {
      return failureServiceResponse('[fetchAllMessages] Unable to access backend')
    }
  },
}
