import { MongoClient } from 'mongodb'
import { failureServiceResponse, IServiceResponse, isILink, ILink } from '../types'
import { LinkCollectionConnection } from './LinkCollectionConnection'

/**
 * BackendLinkGateway handles requests from LinkRouter, and calls on methods
 * in LinkCollectionConnection to interact with the database. It contains
 * the complex logic to check whether the request is valid, before
 * modifying the database.
 */
export class BackendLinkGateway {
  linkCollectionConnection: LinkCollectionConnection

  constructor(mongoClient: MongoClient, collectionName?: string) {
    this.linkCollectionConnection = new LinkCollectionConnection(
      mongoClient,
      collectionName ?? 'links'
    )
  }

  /**
   * Method to create an link and insert it into the database.
   * Note, we do not check whether nodeId exists in the nodeCollection because
   * nodes and links are totally separate microservices - in your final project,
   * you may want to integrate both microservices together if you need more robustness.
   *
   * @param link - The link to be created and inserted into the database.
   * @returns IServiceResponse<ILink> where ILink is the link that has just been
   *          created
   */
  async createLink(link: any): Promise<IServiceResponse<ILink>> {
    // check whether is valid link
    const isValidLink = isILink(link)
    if (!isValidLink) {
      return failureServiceResponse('Not a valid link.')
    }
    // check whether already in database
    const linkResponse = await this.getLinkById(link.linkId)
    if (linkResponse.success) {
      return failureServiceResponse('Link with duplicate ID already exist in database.')
    }
    // if everything check outs, insert link
    const insertResp = await this.linkCollectionConnection.insertLink(link)
    return insertResp
  }

  /**
   * Method to retrieve link with a given linkId.
   *
   * @param linkId - The linkId of the link to be retrieved.
   * @returns IServiceResponse<ILink>
   */
  async getLinkById(linkId: string): Promise<IServiceResponse<ILink>> {
    return this.linkCollectionConnection.findLinkById(linkId)
  }

  /**
   * Method to retrieve links with the given linkIds.
   *
   * @param linkIds - The linkIds of the links to be retrieved.
   * @returns IServiceResponse<ILink[]>
   */
  async getLinksById(linkIds: string[]): Promise<IServiceResponse<ILink[]>> {
    return this.linkCollectionConnection.findLinksById(linkIds)
  }

  /**
   * Method to delete all links in the database.
   *
   * @returns IServiceResponse<{}>
   */
  async deleteAll(): Promise<IServiceResponse<{}>> {
    return await this.linkCollectionConnection.clearLinkCollection()
  }

  /**
   * Method to delete link with the given linkId.
   * Note, this does not delete any anchors associated with the deleted link.
   * The frontend will call deleteAnchors separately if needed.
   * Note, this method returns a success if the link to delete does not exist.
   *
   * @param linkId the linkId of the link
   * @returns Promise<IServiceResponse<{}>>
   */
  async deleteLink(linkId: string): Promise<IServiceResponse<{}>> {
    return this.linkCollectionConnection.deleteLink(linkId)
  }

  /**
   * Method to delete links with given a list of linkIds.
   * Note, this does not delete any anchors associated with the deleted links.
   * The frontend will call deleteAnchors separately if needed.
   * Note, this method returns a success if the links to delete do not exist.
   *
   * @param linkId the linkId of the link
   * @returns Promise<IServiceResponse<{}>>
   */
  async deleteLinks(linkIds: string[]): Promise<IServiceResponse<{}>> {
    return this.linkCollectionConnection.deleteLinks(linkIds)
  }

  /**
   * Method that gets all links attached to a given node.
   *
   * @param anchorId the anchorId of the anchor to get links for
   * @returns Promise<IServiceResponse<ILink[]>>
   */
  async getLinksByAnchorId(anchorId: string): Promise<IServiceResponse<ILink[]>> {
    return this.linkCollectionConnection.findLinksByAnchorId(anchorId)
  }

  /**
   * Method that gets all links attached to a list of anchorIds.
   *
   * @param anchorId list of anchorIds of the anchors to get links for
   * @returns Promise<IServiceResponse<ILink[]>>
   */
  async getLinksByAnchorIds(anchorId: string[]): Promise<IServiceResponse<ILink[]>> {
    return this.linkCollectionConnection.findLinksByAnchorIds(anchorId)
  }
}
