import {
  failureServiceResponse,
  IAnchor,
  ILink,
  INode,
  INodeProperty,
  IServiceResponse,
  IUser,
  RecursiveNodeTree,
} from '../types'
import { endpoint, get, post, put, remove } from '../global'
import { IUserProperty } from '../types/IUserProperty'

/** In development mode (locally) the server is at localhost:5000*/
const baseEndpoint = endpoint

/** This is the path to the nodes microservice */
const servicePath = 'user/'

/**
 * [FRONTEND NODE GATEWAY]
 * FrontendNodeGateway handles HTTP requests to the host, which is located on
 * the server. This FrontendNodeGateway object uses the baseEndpoint, and
 * additional server information to access the requested information.
 *
 * These methods use the get, post, put and remove http requests from request.ts
 * helper methods to make requests to the server.
 */
export const FrontendUserGateway = {
  createUser: async (user: IUser): Promise<IServiceResponse<IUser>> => {
    try {
      return await post<IServiceResponse<IUser>>(baseEndpoint + servicePath + 'create', {
        user: user,
      })
    } catch (exception) {
      return failureServiceResponse('[createUser] Unable to access backend')
    }
  },

  getUser: async (uId: string): Promise<IServiceResponse<IUser>> => {
    try {
      return await post<IServiceResponse<IUser>>(
        baseEndpoint + servicePath + 'getUserByUserId',
        {
          userId: uId,
        }
      )
    } catch (exception) {
      return failureServiceResponse('[getUser] Unable to access backend')
    }
  },

  getUserByMail: async (mail: string): Promise<IServiceResponse<IUser>> => {
    try {
      return await post<IServiceResponse<IUser>>(
        baseEndpoint + servicePath + 'getUserByMail',
        {
          mail: mail,
        }
      )
    } catch (exception) {
      return failureServiceResponse('[getUserByMail] Unable to access backend')
    }
  },

  updateUser: async (
    userId: string,
    properties: IUserProperty[]
  ): Promise<IServiceResponse<IUser>> => {
    try {
      return await put<IServiceResponse<IUser>>(baseEndpoint + servicePath + userId, {
        data: properties,
      })
    } catch (exception) {
      return failureServiceResponse('[updateUser] Unable to access backend')
    }
  },
}
