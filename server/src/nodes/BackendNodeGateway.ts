import { MongoClient } from 'mongodb'
import {
  RecursiveNodeTree,
  failureServiceResponse,
  IServiceResponse,
  successfulServiceResponse,
  INode,
  makeINodePath,
  INodeProperty,
  makeINodeProperty,
  isINodeProperty,
  isINode,
} from '../types'
import { NodeCollectionConnection } from './NodeCollectionConnection'

/**
 * BackendNodeGateway handles requests from NodeRouter, and calls on methods
 * in NodeCollectionConnection to interact with the database. It contains
 * the complex logic to check whether the request is valid, before
 * modifying the database.
 *
 * Example:
 * Before insertion, BackendNodeGateway.createNode() will check whether the database
 * already contains a node with the same nodeId, as well as the the validity of
 * node's file path. In comparison, the NodeCollectionConnection.insertNode()
 * method simply retrieves the node object, and inserts it into the database.
 */
export class BackendNodeGateway {
  nodeCollectionConnection: NodeCollectionConnection

  constructor(mongoClient: MongoClient, collectionName?: string) {
    this.nodeCollectionConnection = new NodeCollectionConnection(
      mongoClient,
      collectionName ?? 'nodes'
    )
  }

  /**
   * Method to create a node and insert it into the database.
   *
   * @param nodeId - The nodeId of the node to be created.
   */
  async createNode(node: any): Promise<IServiceResponse<INode>> {
    // check whether is valid Node
    const isValidNode = isINode(node)
    if (!isValidNode) {
      return failureServiceResponse('Not a valid node.')
    }
    // check whether already in database
    const nodeResponse = await this.nodeCollectionConnection.findNodeById(node.nodeId)
    if (nodeResponse.success) {
      return failureServiceResponse('Node with duplicate ID already exist in database.')
    }
    // check node parent validity
    const nodePath = node.filePath
    // if not root
    if (nodePath.path.length > 1) {
      const parentId = nodePath.path[nodePath.path.length - 2]
      const parentResponse = await this.nodeCollectionConnection.findNodeById(parentId)
      // if parent is not found, or parent has different file path
      if (
        !parentResponse.success ||
        parentResponse.payload.filePath.path.toString() !==
          nodePath.path.slice(0, -1).toString()
      ) {
        return failureServiceResponse('Node has invalid parent / file path.')
      }
      // add nodeId to parent's filePath.children field
      parentResponse.payload.filePath.children.push(node.nodeId)
      const updateParentResp = await this.updateNode(parentResponse.payload.nodeId, [
        { fieldName: 'filePath', value: parentResponse.payload.filePath },
      ])
      if (!updateParentResp.success) {
        return failureServiceResponse('Failed to update parent.filePath.children.')
      }
    }
    // if everything checks out, insert node
    const insertNodeResp = await this.nodeCollectionConnection.insertNode(node)
    return insertNodeResp
  }

  /**
   * Method to retrieve node with a given nodeId.
   *
   * @param nodeId - The nodeId of the node to be retrieved.
   * @returns IServiceResponse<INode>
   */
  async getNodeById(nodeId: string): Promise<IServiceResponse<INode>> {
    return this.nodeCollectionConnection.findNodeById(nodeId)
  }

  /**
   * Method to retrieve nodes with a given nodeIds.
   *
   * @param nodeId - The nodeIds of the nodes to be retrieved.
   * @returns IServiceResponse<INode[]>
   */
  async getNodesById(nodeIds: string[]): Promise<IServiceResponse<INode[]>> {
    return this.nodeCollectionConnection.findNodesById(nodeIds)
  }

  /**
   * Method to delete all nodes in the database.
   *
   * @returns IServiceResponse<{}>
   */
  async deleteAll(): Promise<IServiceResponse<{}>> {
    return await this.nodeCollectionConnection.clearNodeCollection()
  }

  /**
   * Method to delete node with the given nodeId, and all of its children.
   *
   * @param nodeId the nodeId of the node
   * @returns Promise<IServiceResponse<{}>>
   */
  async deleteNode(nodeId: string): Promise<IServiceResponse<{}>> {
    const nodeResponse = await this.getTreeByVertex(nodeId)
    if (!nodeResponse.success) {
      return failureServiceResponse('Failed to find the node you wanted to delete')
    }
    const treeRoot: RecursiveNodeTree = nodeResponse.payload
    const node: INode = treeRoot.node
    const deleteTreeResp = await this.recursivelyDeleteSubtree(treeRoot)
    if (!deleteTreeResp.success) {
      return failureServiceResponse('Failed to delete all children nodes')
    }
    const nodePath = node.filePath.path
    if (nodePath.length > 1) {
      const removeChildResp = await this.removeChild(
        node.nodeId,
        nodePath[nodePath.length - 2]
      )
      if (!removeChildResp.success) {
        return failureServiceResponse(removeChildResp.message)
      }
    }
    return successfulServiceResponse({})
  }

  /**
   * Method to remove a child's nodeId from parent node's filePath.children.
   *
   * @param childId the nodeId of the child
   * @param parentId the nodeId of the parent
   */
  async removeChild(childId: string, parentId: string): Promise<IServiceResponse<{}>> {
    const getParentResp = await this.nodeCollectionConnection.findNodeById(parentId)
    if (!getParentResp.success) {
      return failureServiceResponse(
        'Failed to remove nodeId from parent\'s children field'
      )
    }
    const parent = getParentResp.payload
    const newChildren = []
    parent.filePath.children.forEach((id) => {
      if (id !== childId) {
        newChildren.push(id)
      }
    })
    const updateOldParentResp = await this.updateNode(parent.nodeId, [
      makeINodeProperty('filePath', makeINodePath(parent.filePath.path, newChildren)),
    ])
    if (!updateOldParentResp.success) {
      return failureServiceResponse(
        'Failed to remove nodeToMove from its Parent\'s children field'
      )
    }
    return successfulServiceResponse({})
  }

  /**
   * Move a node by updating its filepath and its new and old
   * parent's filePath.children. Returns the updated node.
   * Note, newParentNodeId = '~' implies that the node will be
   * moved to become a root node
   *
   * @param nodeToMoveId the nodeId of the node to move
   * @param newParentId the nodeId of the new parent
   */
  async moveNode(nodeToMoveId: string, newParentNodeId: string) {
    const getNodeResp = await this.nodeCollectionConnection.findNodeById(nodeToMoveId)
    if (!getNodeResp.success) {
      return failureServiceResponse('Node with nodeId ' + nodeToMoveId + ' not found')
    }
    const nodeToMove = getNodeResp.payload

    if (newParentNodeId !== '~') {
      // add child to new parent's filePath.children, note that this fails if
      // child is already a child of this parent
      const addChildResp = await this.addChild(nodeToMoveId, newParentNodeId)
      if (!addChildResp.success) {
        return failureServiceResponse(addChildResp.message)
      }
    }
    // if nodeToMove is not a root, update the parent's children field
    if (nodeToMove.filePath.path.length > 1) {
      const oldParentId = nodeToMove.filePath.path[nodeToMove.filePath.path.length - 2]
      const removeChildResp = await this.removeChild(nodeToMoveId, oldParentId)
      if (!removeChildResp.success) {
        return failureServiceResponse(removeChildResp.message)
      }
    }

    // update filePath.path of all downstream nodes of nodeToMove
    let newPath
    if (newParentNodeId !== '~') {
      const getNewParentResp = await this.nodeCollectionConnection.findNodeById(
        newParentNodeId
      )
      if (!getNewParentResp.success) {
        return failureServiceResponse(getNewParentResp.message)
      }
      newPath = getNewParentResp.payload.filePath.path.concat([nodeToMoveId])
    } else {
      newPath = [nodeToMoveId]
    }
    const updatePathsResp = await this.recursivelyUpdatePath(
      await this.buildSubtreeHelper(new RecursiveNodeTree(nodeToMove)),
      newPath
    )
    if (!updatePathsResp.success) {
      return failureServiceResponse(updatePathsResp.message)
    }
    const getMovedNodeResp = await this.getNodeById(nodeToMoveId)
    if (!getMovedNodeResp.success) {
      return failureServiceResponse(getMovedNodeResp.message)
    }
    return successfulServiceResponse(getMovedNodeResp.payload)
  }

  /**
   * Method to add a child's nodeId to parent node's filePath.children.
   * Should return failure response when child already exists in parent node's
   * filePath.children.
   *
   * @param childId the nodeId of the child
   * @param parentId the nodeId of the parent
   */
  async addChild(childId: string, parentId: string): Promise<IServiceResponse<{}>> {
    const getParentResp = await this.getNodeById(parentId)
    if (!getParentResp.success) {
      return failureServiceResponse(
        'Failed to remove nodeId from parent\'s children field'
      )
    }
    const parent = getParentResp.payload
    if (parent.filePath.path.includes(childId)) {
      return failureServiceResponse('Child cannot be a descendant/ancestor of itself')
    }
    if (parent.filePath.children.includes(childId)) {
      return failureServiceResponse(
        'Child already exists. ' + 'Child cannot be added to a parent twice.'
      )
    }
    parent.filePath.children.push(childId)
    const updateOldParentResp = await this.updateNode(parent.nodeId, [
      makeINodeProperty(
        'filePath',
        makeINodePath(parent.filePath.path, parent.filePath.children)
      ),
    ])
    if (!updateOldParentResp.success) {
      return failureServiceResponse(
        'Failed to remove nodeToMove from its Parent\'s children field'
      )
    }
    return successfulServiceResponse({})
  }

  /**
   * Method to update the node with the given nodeId.
   * @param nodeId the nodeId of the node
   * @param toUpdate an array of INodeProperty
   *
   * @returns IServiceResponse<INode>
   */
  async updateNode(
    nodeId: string,
    toUpdate: INodeProperty[]
  ): Promise<IServiceResponse<INode>> {
    const properties: any = {}
    for (let i = 0; i < toUpdate.length; i++) {
      if (!isINodeProperty(toUpdate[i])) {
        return failureServiceResponse('toUpdate parameters invalid')
      }
      const fieldName = toUpdate[i].fieldName
      const value = toUpdate[i].value
      properties[fieldName] = value
    }
    const nodeResponse = await this.nodeCollectionConnection.updateNode(
      nodeId,
      properties
    )
    if (!nodeResponse.success) {
      return failureServiceResponse('This node does not exist in the database!')
    }
    return nodeResponse
  }

  /**
   * Method to retrieve the node tree, where the root is the node with
   * the given nodeId.
   * @param nodeId - The nodeId of the node.
   * @returns IServiceResponse<RecursiveNodeTree>
   */
  async getTreeByVertex(nodeId: string): Promise<IServiceResponse<RecursiveNodeTree>> {
    const getResponse = await this.nodeCollectionConnection.findNodeById(nodeId)
    if (!getResponse.success) {
      return failureServiceResponse('Node does not exist')
    }
    const root: INode = getResponse.payload
    const toReturn: RecursiveNodeTree = await this.buildSubtreeHelper(
      new RecursiveNodeTree(root)
    )
    return successfulServiceResponse(toReturn)
  }

  /**
   * Method to get nodes with no parent and all their children.
   * @returns IServiceResponse<RecursiveNodeTree[]>
   */
  async getRoots(): Promise<IServiceResponse<RecursiveNodeTree[]>> {
    const findRootsResp = await this.nodeCollectionConnection.findRoots()
    if (!findRootsResp.success) {
      return failureServiceResponse(findRootsResp.message)
    }
    const nodeQueue: INode[] = findRootsResp.payload
    const rootsToReturn: RecursiveNodeTree[] = []
    for (const root of nodeQueue) {
      rootsToReturn.push(await this.buildSubtreeHelper(new RecursiveNodeTree(root)))
    }
    return successfulServiceResponse(rootsToReturn)
  }

  /**
   * Method to build a tree that represents file structure.
   * @param rootWrapper - The root of the tree.
   * @return rootWrapper with the children appended
   */
  private async buildSubtreeHelper(
    rootWrapper: RecursiveNodeTree
  ): Promise<RecursiveNodeTree> {
    const root = rootWrapper.node
    const childrenNodesResp: IServiceResponse<INode[]> =
      await this.nodeCollectionConnection.findNodesById(root.filePath.children)
    if (childrenNodesResp.success) {
      for (const childNode of childrenNodesResp.payload) {
        const childNodeWrapper = await this.buildSubtreeHelper(
          new RecursiveNodeTree(childNode)
        )
        rootWrapper.addChild(childNodeWrapper)
      }
    }
    return rootWrapper
  }

  /**
   * Method to recursively delete node and all its children.
   * @param rootWrapper The root of the tree.
   * @returns IServiceResponse<{}>
   */
  private async recursivelyDeleteSubtree(
    rootWrapper: RecursiveNodeTree
  ): Promise<IServiceResponse<{}>> {
    for (const child of rootWrapper.children) {
      const deleteChildResp = await this.recursivelyDeleteSubtree(child)
      if (!deleteChildResp.success) {
        return failureServiceResponse(
          'failed to delete node with nodeId: ' + child.node.nodeId
        )
      }
    }
    const deleteResp = await this.nodeCollectionConnection.deleteNode(
      rootWrapper.node.nodeId
    )
    return deleteResp.success
      ? successfulServiceResponse({})
      : failureServiceResponse(
          'failed to delete node with nodeId: ' + rootWrapper.node.nodeId
        )
  }

  /**
   * Method to update a node's and its descendent's filePath.
   *
   * @param rootWrapper the root node to update
   * @param newPath the new path for the root node
   */
  private async recursivelyUpdatePath(
    rootWrapper: RecursiveNodeTree,
    newPath: string[]
  ): Promise<IServiceResponse<{}>> {
    for (const childWrapper of rootWrapper.children) {
      const updatePathResp = await this.recursivelyUpdatePath(
        childWrapper,
        newPath.concat([childWrapper.node.nodeId])
      )
      if (!updatePathResp.success) {
        return failureServiceResponse(updatePathResp.message)
      }
    }
    const updatePathResp = await this.nodeCollectionConnection.updatePath(
      rootWrapper.node.nodeId,
      newPath
    )
    return updatePathResp.success
      ? successfulServiceResponse({})
      : failureServiceResponse(
          'failed to update path node with nodeId: ' +
            rootWrapper.node.nodeId +
            ', path: ' +
            newPath
        )
  }
}
