import {
  failureServiceResponse,
  IAnchor,
  ILink,
  INode,
  INodeProperty,
  IServiceResponse,
  RecursiveNodeTree,
} from '../types'
import { endpoint, get, post, put, remove } from '../global'
import { FrontendAnchorGateway } from '../anchors'
import { FrontendLinkGateway } from '../links'

/** In development mode (locally) the server is at localhost:5000*/
const baseEndpoint = endpoint

/** This is the path to the nodes microservice */
const servicePath = 'node/'

/**
 * [FRONTEND NODE GATEWAY]
 * FrontendNodeGateway handles HTTP requests to the host, which is located on
 * the server. This FrontendNodeGateway object uses the baseEndpoint, and
 * additional server information to access the requested information.
 *
 * These methods use the get, post, put and remove http requests from request.ts
 * helper methods to make requests to the server.
 */
export const FrontendNodeGateway = {
  createNode: async (node: INode): Promise<IServiceResponse<INode>> => {
    try {
      return await post<IServiceResponse<INode>>(baseEndpoint + servicePath + 'create', {
        node: node,
      })
    } catch (exception) {
      return failureServiceResponse('[createNode] Unable to access backend')
    }
  },

  /**
   * This is method is that is called whenever a node is deleted
   *
   * Explainer:
   * Now that our system supports anchors and links, whenever we delete a
   * node, we want to delete the links that are on the node we are deleting.
   *
   * Anchors can have multiple links but if an anchor is only attached to
   * one link and that link gets deleted, this anchor becomes an orphan anchor.
   * We need to delete these orphan anchors from the database. Note, link and orphan
   * anchor deletion will be handled by FrontendLinkGateway.deleteLinks().
   *
   * In this method we want to get the links associated with a node and delete those
   * links via FrontendLinkGateway.deleteLinks(). Once the links and associated
   * orphan anchors have been deleted, we can delete the node as we did in Assignment
   * 1.
   *
   * TIPS:
   * You will likely need to make the following requests in this order:
   * - get anchors by nodeId (frontend FrontendAnchorGateway)
   * - get links by anchorIds (frontend FrontendLinkGateway)
   * - delete links and associated orphan anchors (frontend FrontendLinkGateway)
   * - delete node (request directly to backend)
   *
   * @param nodeId nodeId of the node to delete
   * @returns Promise<IServiceResponse<{}>>
   */
  deleteNode: async (nodeId: string): Promise<IServiceResponse<{}>> => {
    try {
      // get anchorsByNodeId
      const anchorsResp: IServiceResponse<IAnchor[]> =
        await FrontendAnchorGateway.getAnchorsByNodeId(nodeId)
      if (!anchorsResp.success || !anchorsResp.payload) {
        return anchorsResp
      }
      const anchors: IAnchor[] = anchorsResp.payload
      const anchorIds = anchors.map((anchor: IAnchor) => anchor.anchorId)
      // get linksByAnchorIds
      const linksResp: IServiceResponse<ILink[]> =
        await FrontendLinkGateway.getLinksByAnchorIds(anchorIds)
      if (!linksResp.success || !linksResp.payload) {
        return linksResp
      }
      const links: ILink[] = linksResp.payload
      const linkIds = links.map((link: ILink) => link.linkId)
      // delete links and associated anchors
      const deleteLinksResp = await FrontendLinkGateway.deleteLinks(linkIds)
      if (!deleteLinksResp.success) {
        return deleteLinksResp
      }
      // delete node
      return await remove<IServiceResponse<INode>>(baseEndpoint + servicePath + nodeId)
    } catch (exception) {
      return failureServiceResponse('[deleteNode] Unable to access backend')
    }
  },

  getNode: async (nodeId: string): Promise<IServiceResponse<INode>> => {
    try {
      return await get<IServiceResponse<INode>>(
        baseEndpoint + servicePath + 'get/' + nodeId
      )
    } catch (exception) {
      return failureServiceResponse('[getNode] Unable to access backend')
    }
  },

  getNodes: async (nodeIds: string[]): Promise<IServiceResponse<INode[]>> => {
    try {
      return await post<IServiceResponse<INode[]>>(
        baseEndpoint + servicePath + 'getNodesById',
        {
          nodeIds: nodeIds,
        }
      )
    } catch (exception) {
      return failureServiceResponse('[getNodes] Unable to access backend')
    }
  },

  getRoots: async (): Promise<IServiceResponse<RecursiveNodeTree[]>> => {
    try {
      return await get<IServiceResponse<RecursiveNodeTree[]>>(
        baseEndpoint + servicePath + 'roots'
      )
    } catch (exception) {
      return failureServiceResponse('[getNodeByPath] Unable to access backend')
    }
  },

  moveNode: async ({
    nodeId,
    newParentId,
  }: {
    newParentId: string
    nodeId: string
  }): Promise<IServiceResponse<INode>> => {
    try {
      const emptyBody = {}
      return await put<IServiceResponse<INode>>(
        baseEndpoint + servicePath + 'move/' + `${nodeId}/` + `${newParentId}/`,
        emptyBody
      )
    } catch (exception) {
      return failureServiceResponse('[moveNode] Unable to access backend')
    }
  },

  updateNode: async (
    nodeId: string,
    properties: INodeProperty[]
  ): Promise<IServiceResponse<INode>> => {
    try {
      return await put<IServiceResponse<INode>>(baseEndpoint + servicePath + nodeId, {
        data: properties,
      })
    } catch (exception) {
      return failureServiceResponse('[updateNode] Unable to access backend')
    }
  },
}
