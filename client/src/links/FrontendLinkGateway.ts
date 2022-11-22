import { failureServiceResponse, ILink, IServiceResponse } from '../types'
import { endpoint, get, post } from '../global'
import { FrontendAnchorGateway } from '../anchors'

/** In development mode (locally) the server is at localhost:5000*/
const baseEndpoint = endpoint

/** This is the path to the link microservice */
const servicePath = 'link/'

/**
 * [FRONTEND LINK GATEWAY]
 * FrontendLinkGateway handles HTTP requests to the host, which is located on
 * the server. This FrontendLinkGateway object uses the baseEndpoint, and
 * additional server information to access the requested information.
 *
 * These methods use the get, post, put and remove http requests from request.ts
 * helper methods to make requests to the server.
 */
export const FrontendLinkGateway = {
  createLink: async (link: ILink): Promise<IServiceResponse<ILink>> => {
    try {
      return await post<IServiceResponse<ILink>>(baseEndpoint + servicePath + 'create', {
        link: link,
      })
    } catch (exception) {
      return failureServiceResponse('[createLink] Unable to access backend')
    }
  },

  getLinkById: async (linkId: string): Promise<IServiceResponse<ILink>> => {
    try {
      return await get<IServiceResponse<ILink>>(
        baseEndpoint + servicePath + 'getLinkById/' + linkId
      )
    } catch (exception) {
      return failureServiceResponse('[getLinksById] Unable to access backend')
    }
  },

  getLinksById: async (linkIds: string[]): Promise<IServiceResponse<ILink[]>> => {
    try {
      return await post<IServiceResponse<ILink[]>>(
        baseEndpoint + servicePath + 'getLinksById',
        {
          linkIds: linkIds,
        }
      )
    } catch (exception) {
      return failureServiceResponse('[getLinksById] Unable to access backend')
    }
  },

  deleteLink: async (linkId: string): Promise<IServiceResponse<{}>> => {
    try {
      return await FrontendLinkGateway.deleteLinks([linkId])
    } catch (exception) {
      return failureServiceResponse('[deleteLink] Unable to access backend')
    }
  },

  /**
   * This is method is that is called whenever links are deleted
   *
   * Explainer:
   * Now that our system supports anchors and links, whenever we delete links,
   * we want to delete the anchors that are made orphans as a result of our deletion.
   *
   * Anchors can technically have multiple links, but if an anchor is only attached to
   * one link and that link gets deleted, this anchor then becomes an orphan.
   * We need to delete these orphan anchors from the database as they don't serve a
   * purpose anymore.
   *
   * In this method we want to get the anchors associated with our list of links (let's
   * call these anchors 'anchors'). Then we delete our links. Then we want to
   * fetch all links that are associated with 'anchors'. Then we will want to figure out
   * which anchors in 'anchors' no longer have any links. These anchors are orphan anchors
   * and we want to delete them. Once these links and anchors are deleted, we can return a
   * successful service response.
   *
   *
   * TIPS:
   * You will likely need to make the following requests in this order:
   * - get links by id (frontend FrontendLinkGateway)
   * - delete links (request directly to backend)
   * - get links by anchorIds (frontend FrontendLinkGateway)
   * - delete anchors (frontend AnchorGatway)
   *
   * @param linkIds linkIds of the links to delete
   * @returns Promise<IServiceResponse<{}>>
   */
  deleteLinks: async (linkIds: string[]): Promise<IServiceResponse<{}>> => {
    try {
      // get anchors related to links
      const getLinksResp = await FrontendLinkGateway.getLinksById(linkIds)
      if (!getLinksResp.success || !getLinksResp.payload) {
        return getLinksResp
      }
      const links = getLinksResp.payload
      const anchorsSet: Set<string> = new Set()
      links.map((link) => {
        anchorsSet.add(link.anchor1Id)
        anchorsSet.add(link.anchor2Id)
      })
      const anchorsList = Array.from(anchorsSet.values())

      // delete links
      const deleteLinksResp = await post<IServiceResponse<{}>>(
        baseEndpoint + servicePath + 'delete',
        {
          linkIds: linkIds,
        }
      )
      if (!deleteLinksResp.success) {
        return deleteLinksResp
      }

      // identify orphan anchors
      const remainingLinksResp = await FrontendLinkGateway.getLinksByAnchorIds(
        anchorsList
      )
      if (!remainingLinksResp.success || !remainingLinksResp.payload) {
        return remainingLinksResp
      }
      const remainingLinks = remainingLinksResp.payload
      remainingLinks.map((link: ILink) => {
        anchorsSet.delete(link.anchor1Id)
        anchorsSet.delete(link.anchor2Id)
      })
      const orphanAnchors = Array.from(anchorsSet.values())

      // delete orphan anchors
      return await FrontendAnchorGateway.deleteAnchors(orphanAnchors)
    } catch (exception) {
      return failureServiceResponse('[deleteLinks] Unable to access backend')
    }
  },

  getLinksByAnchorId: async (anchorId: string): Promise<IServiceResponse<ILink[]>> => {
    try {
      return await get<IServiceResponse<ILink[]>>(
        baseEndpoint + servicePath + 'getByAnchorId/' + anchorId
      )
    } catch (exception) {
      return failureServiceResponse('[getLinksByAnchorId] Unable to access backend')
    }
  },

  getLinksByAnchorIds: async (
    anchorIds: string[]
  ): Promise<IServiceResponse<ILink[]>> => {
    try {
      return await post<IServiceResponse<ILink[]>>(
        baseEndpoint + servicePath + 'getByAnchorIds',
        {
          anchorIds: anchorIds,
        }
      )
    } catch (exception) {
      return failureServiceResponse('[getLinksByAnchorIds] Unable to access backend')
    }
  },
}
