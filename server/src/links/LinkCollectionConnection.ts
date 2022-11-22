import {
  IServiceResponse,
  failureServiceResponse,
  successfulServiceResponse,
  ILink,
  isILink,
} from '../types'
import { MongoClient } from 'mongodb'

/**
 * LinkCollectionConnection acts as an in-between communicator between
 * the MongoDB database and BackendLinkGateway. LinkCollectionConnection
 * defines methods that interact directly with MongoDB. That said,
 * it does not include any of the complex logic that BackendLinkGateway has.
 * Note, currently, BackendAnchorGateway is very simple. But as we add more complexity
 * to our system, we will implement that logic in BackendAnchorGateway.
 *
 * @param {MongoClient} client
 * @param {string} collectionName
 */
export class LinkCollectionConnection {
  client: MongoClient
  collectionName: string

  constructor(mongoClient: MongoClient, collectionName?: string) {
    this.client = mongoClient
    this.collectionName = collectionName ?? 'links'
  }

  /**
   * Inserts a new link into the database
   * Returns successfulServiceResponse with ILink that was inserted as the payload
   *
   *
   * @param {ILink} link
   * @return successfulServiceResponse<ILink>
   */
  async insertLink(link: ILink): Promise<IServiceResponse<ILink>> {
    if (!isILink(link)) {
      return failureServiceResponse(
        'Failed to insert link due to improper input ' +
          'to linkCollectionConnection.insertLink'
      )
    }
    const insertResponse = await this.client
      .db()
      .collection(this.collectionName)
      .insertOne(link)
    if (insertResponse.insertedCount) {
      return successfulServiceResponse(insertResponse.ops[0])
    }
    return failureServiceResponse(
      'Failed to insert link, insertCount: ' + insertResponse.insertedCount
    )
  }

  /**
   * Clears the entire link collection in the database.
   *
   *
   * @return successfulServiceResponse<{}> on success
   *         failureServiceResponse on failure
   */
  async clearLinkCollection(): Promise<IServiceResponse<{}>> {
    const response = await this.client.db().collection(this.collectionName).deleteMany({})
    if (response.result.ok) {
      return successfulServiceResponse({})
    }
    return failureServiceResponse('Failed to clear link collection.')
  }

  /**
   * Finds Link by its unique linkId
   *
   *
   * @param {string} linkId
   * @return successfulServiceResponse<ILink> on success
   *         failureServiceResponse on failure
   */
  async findLinkById(linkId: string): Promise<IServiceResponse<ILink>> {
    const findResponse = await this.client
      .db()
      .collection(this.collectionName)
      .findOne({ linkId: linkId })
    if (findResponse == null) {
      return failureServiceResponse('Failed to find link with this linkId.')
    } else {
      return successfulServiceResponse(findResponse)
    }
  }

  /**
   * Finds links when given a list of linkIds.
   * Returns successfulServiceResponse with empty array when no links found.
   *
   *
   * @param {string[]} linkIds
   * @return successfulServiceResponse<ILink[]>
   */
  async findLinksById(linkIds: string[]): Promise<IServiceResponse<ILink[]>> {
    const foundLinks: ILink[] = []
    await this.client
      .db()
      .collection(this.collectionName)
      .find({ linkId: { $in: linkIds } })
      .forEach(function(doc) {
        foundLinks.push(doc)
      })
    return successfulServiceResponse(foundLinks)
  }

  /**
   * Deletes link with the given linkId.
   * If link to delete was not found, return success.
   *
   *
   * @param {string} linkId
   * @return successfulServiceResponse<ILink> on success
   *         failureServiceResponse on failure
   */
  async deleteLink(linkId: string): Promise<IServiceResponse<{}>> {
    const collection = await this.client.db().collection(this.collectionName)
    const deleteResponse = await collection.deleteOne({ linkId: linkId })
    if (deleteResponse.result.ok) {
      return successfulServiceResponse({})
    }
    return failureServiceResponse('Failed to delete link')
  }

  /**
   * Deletes links when given a list of linkIds.
   *
   *
   * @param {string[]} linkIds
   * @return successfulServiceResponse<{}> on success
   *         failureServiceResponse on failure
   */
  async deleteLinks(linkIds: string[]): Promise<IServiceResponse<{}>> {
    const collection = await this.client.db().collection(this.collectionName)
    const myQuery = { linkId: { $in: linkIds } }
    const deleteResponse = await collection.deleteMany(myQuery)
    if (deleteResponse.result.ok) {
      return successfulServiceResponse({})
    }
    return failureServiceResponse('Failed to delete links')
  }

  /**
   * Finds and returns all links attached to a given anchor.
   *
   *
   * @param {string[]} anchorIds
   * @return successfulServiceResponse<ILink[]> on success
   *         failureServiceResponse on failure
   */
  async findLinksByAnchorId(anchorId: string): Promise<IServiceResponse<ILink[]>> {
    const foundLinks = []
    const myQuery = { $or: [{ anchor1Id: anchorId }, { anchor2Id: anchorId }] }
    await this.client
      .db()
      .collection(this.collectionName)
      .find(myQuery)
      .forEach(function(doc) {
        foundLinks.push(doc)
      })
    return successfulServiceResponse(foundLinks)
  }

  /**
   * Finds and returns all links attached to a list of anchors.
   * This will be used when we delete a node. When we delete a node,
   * we need to fetch all the links attached to that node, which we
   * can only do by first fetching all anchors whose 'nodeId' matches
   * the nodeId of the node to delete.
   *
   *
   * @param {string[]} anchorIds
   * @return successfulServiceResponse<ILink[]> on success
   *         failureServiceResponse on failure
   */
  async findLinksByAnchorIds(anchorIds: string[]): Promise<IServiceResponse<ILink[]>> {
    const foundLinks = []
    const myQuery = {
      $or: [{ anchor1Id: { $in: anchorIds } }, { anchor2Id: { $in: anchorIds } }],
    }
    await this.client
      .db()
      .collection(this.collectionName)
      .find(myQuery)
      .forEach(function(doc) {
        foundLinks.push(doc)
      })
    return successfulServiceResponse(foundLinks)
  }
}
