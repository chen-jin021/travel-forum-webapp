import { Extent, failureServiceResponse, IAnchor, IServiceResponse } from '../types'
import { endpoint, get, post, remove } from '../global'

/** In development mode (locally) the server is at localhost:5000*/
const baseEndpoint = endpoint

/** This is the path to the anchor microservice */
const servicePath = 'anchor/'

/**
 * [FRONTEND ANCHOR GATEWAY]
 * FrontendAnchorGateway handles HTTP requests to the host, which is located on the
 * server. This FrontendAnchorGateway object uses the baseEndpoint, and additional
 * server information to access the requested information.
 *
 * These methods use the get, post, put and remove http requests from request.ts
 * helper methods to make requests to the server.
 */
export const FrontendAnchorGateway = {
  createAnchor: async (anchor: IAnchor): Promise<IServiceResponse<IAnchor>> => {
    try {
      return await post<IServiceResponse<IAnchor>>(
        baseEndpoint + servicePath + 'create',
        {
          anchor: anchor,
        }
      )
    } catch (exception) {
      return failureServiceResponse('[createAnchor] Unable to access backend')
    }
  },

  deleteAnchor: async (anchorId: string): Promise<IServiceResponse<{}>> => {
    try {
      return await remove<IServiceResponse<IAnchor>>(
        baseEndpoint + servicePath + anchorId
      )
    } catch (exception) {
      return failureServiceResponse('[deleteAnchor] Unable to access backend')
    }
  },

  deleteAnchors: async (anchorIds: string[]): Promise<IServiceResponse<{}>> => {
    try {
      return await post<IServiceResponse<{}>>(baseEndpoint + servicePath + 'delete', {
        anchorIds: anchorIds,
      })
    } catch (exception) {
      return failureServiceResponse('[deleteAnchors] Unable to access backend')
    }
  },

  getAnchor: async (anchorId: string): Promise<IServiceResponse<IAnchor>> => {
    try {
      return await get<IServiceResponse<IAnchor>>(baseEndpoint + servicePath + anchorId)
    } catch (exception) {
      return failureServiceResponse('[getAnchor] Unable to access backend')
    }
  },

  getAnchors: async (anchorIds: string[]): Promise<IServiceResponse<IAnchor[]>> => {
    try {
      return await post<IServiceResponse<IAnchor[]>>(
        baseEndpoint + servicePath + 'getAnchorsById',
        {
          anchorIds: anchorIds,
        }
      )
    } catch (exception) {
      return failureServiceResponse('[getAnchor] Unable to access backend')
    }
  },

  getAnchorsByNodeId: async (nodeId: string): Promise<IServiceResponse<IAnchor[]>> => {
    try {
      return await get<IServiceResponse<IAnchor[]>>(
        baseEndpoint + servicePath + 'getByNodeId/' + nodeId
      )
    } catch (exception) {
      return failureServiceResponse('[getAnchorsByNodeId] Unable to access backend')
    }
  },

  updateExtent: async (
    anchorId: string,
    extent: Extent
  ): Promise<IServiceResponse<IAnchor>> => {
    try {
      return await post<IServiceResponse<IAnchor>>(
        baseEndpoint + servicePath + 'updateExtent',
        {
          anchorId: anchorId,
          extent: extent,
        }
      )
    } catch (exception) {
      return failureServiceResponse('[updateAnchorExtent] Unable to access backend')
    }
  },
}
