import { MongoClient } from 'mongodb'
import {
  failureServiceResponse,
  IServiceResponse,
  IAnchor,
  isIAnchor,
  isExtent,
} from '../types'
import { AnchorCollectionConnection } from './AnchorCollectionConnection'

/**
 * BackendAnchorGateway handles requests from AnchorRouter, and calls on methods
 * in AnchorCollectionConnection to interact with the database. It contains
 * the complex logic to check whether the request is valid, before
 * modifying the database.
 */
export class BackendAnchorGateway {
  anchorCollectionConnection: AnchorCollectionConnection

  constructor(mongoClient: MongoClient, collectionName?: string) {
    this.anchorCollectionConnection = new AnchorCollectionConnection(
      mongoClient,
      collectionName ?? 'anchors'
    )
  }

  /**
   * Method to create an anchor and insert it into the database.
   * Note, we do not check whether nodeId exists in the nodeCollection because
   * nodes and anchors are totally separate microservices - in your final project,
   * you may want to integrate both microservices together if you need more robustness.
   *
   * @param anchor - The anchor to be created and inserted into the database.
   * @returns IServiceResponse<IAnchor> where IAnchor is the anchor that has just been
   *          created
   */
  async createAnchor(anchor: any): Promise<IServiceResponse<IAnchor>> {
    // check whether is valid Anchor
    const isValidAnchor = isIAnchor(anchor)
    if (!isValidAnchor) {
      return failureServiceResponse('Not a valid anchor.')
    }
    // check whether already in database
    const anchorResponse = await this.getAnchorById(anchor.anchorId)
    if (anchorResponse.success) {
      return failureServiceResponse('Anchor with duplicate ID already exist in database.')
    }
    // if everything check out, insert anchor
    const insertResp = await this.anchorCollectionConnection.insertAnchor(anchor)
    return insertResp
  }

  /**
   * Method to retrieve anchor with a given anchorId.
   *
   * @param anchorId - The anchorId of the anchor to be retrieved.
   * @returns IServiceResponse<IAnchor>
   */
  async getAnchorById(anchorId: string): Promise<IServiceResponse<IAnchor>> {
    return this.anchorCollectionConnection.findAnchorById(anchorId)
  }

  /**
   * Method to retrieve anchor with a given anchorId.
   *
   * @param anchorIds - The anchorIds of the anchors to be retrieved.
   * @returns IServiceResponse<IAnchor[]>
   */
  async getAnchorsById(anchorIds: string[]): Promise<IServiceResponse<IAnchor[]>> {
    return this.anchorCollectionConnection.findAnchorsById(anchorIds)
  }

  /**
   * Method to delete all anchors in the database.
   *
   * @returns IServiceResponse<{}>
   */
  async deleteAll(): Promise<IServiceResponse<{}>> {
    return await this.anchorCollectionConnection.clearAnchorCollection()
  }

  /**
   * Method to delete anchor with the given anchorId.
   * Note, this does not delete any links associated with the deleted anchor.
   * The frontend will call deleteLinks separately if needed.
   * Note, this method returns a success if the anchor to delete does not exist.
   *
   * @param anchorId the anchorId of the anchor
   * @returns Promise<IServiceResponse<{}>>
   */
  async deleteAnchor(anchorId: string): Promise<IServiceResponse<{}>> {
    return this.anchorCollectionConnection.deleteAnchor(anchorId)
  }

  /**
   * Method to delete anchors with given a list of anchorIds.
   * Note, this does not delete any links associated with the deleted anchors.
   * The frontend will call deleteLinks separately if needed.
   * Note, this method returns a success if the anchors to delete do not exist.
   *
   * @param anchorId the anchorId of the anchor
   * @returns Promise<IServiceResponse<{}>>
   */
  async deleteAnchors(anchorIds: string[]): Promise<IServiceResponse<{}>> {
    return this.anchorCollectionConnection.deleteAnchors(anchorIds)
  }

  /**
   * Method that gets all anchors attached to a given node.
   *
   * @param nodeId the nodeId of the node to get anchors for
   * @returns Promise<IServiceResponse<IAnchor[]>>
   */
  async getAnchorsByNodeId(nodeId: string): Promise<IServiceResponse<IAnchor[]>> {
    return this.anchorCollectionConnection.findAnchorsByNodeId(nodeId)
  }

  /**
   * Method that updates the anchor extent of a node with a certain anchorId
   *
   * @param nodeId the nodeId of the node to get anchors for
   * @returns Promise<IServiceResponse<IAnchor[]>>
   */
  async updateExtent(anchorId: string, extent: any): Promise<IServiceResponse<IAnchor>> {
    if (!isExtent(extent)) {
      return failureServiceResponse('extent is not a valid extent')
    }
    return this.anchorCollectionConnection.updateExtent(anchorId, extent)
  }
}
