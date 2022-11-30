import {
  INode,
  ILocNode,
  isINode,
  IServiceResponse,
  failureServiceResponse,
  successfulServiceResponse,
  makeINodePath,
  isINodePath,
} from '../types'
import { MongoClient } from 'mongodb'

/**
 * NodeCollectionConnection acts as an in-between communicator between
 * the MongoDB database and BackendNodeGateway. NodeCollectionConnection
 * defines methods that interact directly with MongoDB. That said,
 * it does not include any of the complex logic that BackendNodeGateway has.
 *
 * For example:
 * NodeCollectionConnection.deleteNode() will only delete a single node.
 * BackendNodeGateway.deleteNode() deletes all its children from the database
 * as well.
 *
 * @param {MongoClient} client
 * @param {string} collectionName
 */
export class NodeCollectionConnection {
  client: MongoClient
  collectionName: string

  constructor(mongoClient: MongoClient, collectionName?: string) {
    this.client = mongoClient
    this.collectionName = collectionName ?? 'nodes'
  }

  /**
   * Inserts a new node into the database
   * Returns successfulServiceResponse with INode that was inserted as the payload
   *
   * @param {INode} node
   * @return successfulServiceResponse<INode>
   */
  async insertNode(node: INode): Promise<IServiceResponse<INode>> {
    if (!isINode(node)) {
      return failureServiceResponse(
        'Failed to insert node due to improper input ' +
          'to nodeCollectionConnection.insertNode'
      )
    }
    const insertResponse = await this.client
      .db()
      .collection(this.collectionName)
      .insertOne(node)
    if (insertResponse.insertedCount) {
      return successfulServiceResponse(insertResponse.ops[0])
    }
    return failureServiceResponse(
      'Failed to insert node, insertCount: ' + insertResponse.insertedCount
    )
  }

  /**
   * Clears the entire node collection in the database.
   *
   * @return successfulServiceResponse on success
   *         failureServiceResponse on failure
   */
  async clearNodeCollection(): Promise<IServiceResponse<{}>> {
    const response = await this.client.db().collection(this.collectionName).deleteMany({})
    if (response.result.ok) {
      return successfulServiceResponse({})
    }
    return failureServiceResponse('Failed to clear node collection.')
  }

  /**
   * Clears the entire node collection in the database.
   *
   * @param {string} nodeId
   * @return successfulServiceResponse<INode> on success
   *         failureServiceResponse on failure
   */
  async findNodeById(nodeId: string): Promise<IServiceResponse<INode>> {
    const findResponse = await this.client
      .db()
      .collection(this.collectionName)
      .findOne({ nodeId: nodeId })
    if (findResponse == null) {
      return failureServiceResponse('Failed to find node with this nodeId.')
    } else {
      return successfulServiceResponse(findResponse)
    }
  }

  /**
   * Finds nodes when given a list of nodeIds.
   * Returns successfulServiceResponse with empty array when no nodes found.
   *
   * @param {string[]} nodeIds
   * @return successfulServiceResponse<INode[]>
   */
  async findNodesById(nodeIds: string[]): Promise<IServiceResponse<INode[]>> {
    const foundNodes: INode[] = []
    await this.client
      .db()
      .collection(this.collectionName)
      .find({ nodeId: { $in: nodeIds } })
      .forEach(function(doc) {
        foundNodes.push(doc)
      })
    return successfulServiceResponse(foundNodes)
  }
  /**
   * Find Node by Lat and Lng
   *
   * @param {number} lat
   * @param {number} lng
   * @return successfulServiceResponse<ILocNode> on success
   *         failureServiceResponse on failure
   */
  async findNodeByLatlng(lat: number, lng: number): Promise<IServiceResponse<ILocNode>> {
    const findResponse = await this.client
      .db()
      .collection(this.collectionName)
      .findOne({ lat: lat, lng: lng })
    if (findResponse == null) {
      return failureServiceResponse('Failed to find loc node with this lat and lng.')
    } else {
      return successfulServiceResponse(findResponse)
    }
  }

  /**
   * Updates node when given a nodeId and a set of properties to update.
   *
   * @param {string} nodeId
   * @param {Object} properties to update in MongoDB
   * @return successfulServiceResponse<INode> on success
   *         failureServiceResponse on failure
   */
  async updateNode(
    nodeId: string,
    updatedProperties: Object
  ): Promise<IServiceResponse<INode>> {
    const updateResponse = await this.client
      .db()
      .collection(this.collectionName)
      .findOneAndUpdate(
        { nodeId: nodeId },
        { $set: updatedProperties },
        { returnDocument: 'after' }
      )
    if (updateResponse.ok && updateResponse.lastErrorObject.n) {
      return successfulServiceResponse(updateResponse.value)
    }
    return failureServiceResponse(
      'Failed to update node, lastErrorObject: ' +
        updateResponse.lastErrorObject.toString()
    )
  }

  /**
   * Deletes node with the given nodeId.
   *
   * @param {string} nodeId
   * @return successfulServiceResponse<INode> on success
   *         failureServiceResponse on failure
   */
  async deleteNode(nodeId: string): Promise<IServiceResponse<{}>> {
    const collection = await this.client.db().collection(this.collectionName)
    const deleteResponse = await collection.deleteOne({ nodeId: nodeId })
    if (deleteResponse.result.ok) {
      return successfulServiceResponse({})
    }
    return failureServiceResponse('Failed to delete')
  }

  /**
   * Deletes nodes when given a list of nodeIds.
   *
   * @param {string[]} nodeIds
   * @return successfulServiceResponse<INode> on success
   *         failureServiceResponse on failure
   */
  async deleteNodes(nodeIds: string[]): Promise<IServiceResponse<{}>> {
    const collection = await this.client.db().collection(this.collectionName)
    const myquery = { nodeId: { $in: nodeIds } }
    const deleteResponse = await collection.deleteMany(myquery)
    if (deleteResponse.result.ok) {
      return successfulServiceResponse({})
    }
    return failureServiceResponse('Failed to update nodes')
  }

  /**
   * Find roots from database. Roots are defined as nodes with no parent.
   * Returns empty array when no roots found.
   *
   * @return successfulServiceResponse<INode[]>
   */
  async findRoots(): Promise<IServiceResponse<INode[]>> {
    const roots: INode[] = []
    await this.client
      .db()
      .collection(this.collectionName)
      .find({ 'filePath.path': { $size: 1 } })
      .forEach(function(node) {
        const validNode = isINode(node)
        if (validNode) {
          roots.push(node)
        }
      })
    return successfulServiceResponse(roots)
  }

  async fetchNodesByUserId(userId: string): Promise<IServiceResponse<INode[]>> {
    const nodes: INode[] = []
    await this.client
      .db()
      .collection(this.collectionName)
      .find({
        $or: [{ userReadIds: userId }, { userWriteIds: userId }, { ownerId: userId }],
      })
      .forEach(function(node) {
        const validNode = isINode(node)
        if (validNode) {
          nodes.push(node)
        }
      })
    return successfulServiceResponse(nodes)
  }

  /**
   * Update the path of given node.
   *
   * @param {string} nodeId
   * @param {string[]} newPath
   * @return successfulServiceResponse<{}>
   */
  async updatePath(nodeId: string, newPath: string[]): Promise<IServiceResponse<{}>> {
    if (!isINodePath(makeINodePath(newPath)) || newPath[newPath.length - 1] !== nodeId) {
      return failureServiceResponse('newPath in nodeCollectionConnection is invalid')
    }
    const updatePathResp = await this.client
      .db()
      .collection(this.collectionName)
      .findOneAndUpdate({ nodeId: nodeId }, { $set: { 'filePath.path': newPath } })
    if (updatePathResp.ok && updatePathResp.lastErrorObject.n) {
      return successfulServiceResponse({})
    }
    return failureServiceResponse('Failed to update node ' + nodeId + ' filePath.path')
  }

  async searchByRelevance(term: string): Promise<IServiceResponse<INode[]>> {
    await this.client
      .db()
      .collection(this.collectionName)
      .createIndex({ title: 'text', content: 'text' })
    const query = { $text: { $search: term } }
    // sort returned documents by descending text relevance score
    const sort = { score: { $meta: 'textScore' } }
    // find documents based on our query, sort, and projection
    // const cursor = collection.find(query).sort(sort).project(projection)
    const nodes: INode[] = []
    await this.client
      .db()
      .collection(this.collectionName)
      .find(query)
      .sort(sort)
      .forEach(function(node) {
        const validNode = isINode(node)
        if (validNode) {
          nodes.push(node)
        }
      })
    return successfulServiceResponse(nodes)
  }
}
