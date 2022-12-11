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
import { IInvitation } from '../types/IInvitation'

/** In development mode (locally) the server is at localhost:5000*/
const baseEndpoint = endpoint

/** This is the path to the nodes microservice */
const servicePath = 'ivt/'

/**
 * [FRONTEND INVITATION GATEWAY]
 * FrontendNodeGateway handles HTTP requests to the host, which is located on
 * the server. This FrontendNodeGateway object uses the baseEndpoint, and
 * additional server information to access the requested information.
 *
 * These methods use the get, post, put and remove http requests from request.ts
 * helper methods to make requests to the server.
 */
export const FrontendInvitationGateway = {
  createIvt: async (ivt: IInvitation): Promise<IServiceResponse<IInvitation>> => {
    try {
      return await post<IServiceResponse<IInvitation>>(
        baseEndpoint + servicePath + 'create',
        {
          invitation: ivt,
        }
      )
    } catch (exception) {
      return failureServiceResponse('[createIvt] Unable to access backend')
    }
  },

  getSentIvt: async (userId: string): Promise<IServiceResponse<IInvitation[]>> => {
    try {
      return await post<IServiceResponse<IInvitation[]>>(
        baseEndpoint + servicePath + 'getSentInvitesByUserId',
        {
          userId: userId,
        }
      )
    } catch (exception) {
      return failureServiceResponse('[getSentIvt] Unable to access backend')
    }
  },

  getRcvIvt: async (userId: string): Promise<IServiceResponse<IInvitation[]>> => {
    try {
      return await post<IServiceResponse<IInvitation[]>>(
        baseEndpoint + servicePath + 'getRcvInvitesByUserId',
        {
          userId: userId,
        }
      )
    } catch (exception) {
      return failureServiceResponse('[getRcvIvt] Unable to access backend')
    }
  },

  declineIvt: async (inviteId: string): Promise<IServiceResponse<{}>> => {
    try {
      return await remove<IServiceResponse<INode>>(baseEndpoint + servicePath + inviteId)
    } catch (exception) {
      return failureServiceResponse('[declineInvitation] Unable to access backend')
    }
  },

  acceptIvt: async (inviteId: string): Promise<IServiceResponse<{}>> => {
    try {
      return await get<IServiceResponse<INode>>(baseEndpoint + servicePath + inviteId)
    } catch (exception) {
      return failureServiceResponse('[acceptInvitation] Unable to access backend')
    }
  },
}
