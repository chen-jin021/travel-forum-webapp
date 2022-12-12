import express, { Request, response, Response, Router } from 'express'
import { MongoClient } from 'mongodb'
import {
  INode,
  ILocNode,
  INodeProperty,
  RecursiveNodeTree,
  IServiceResponse,
  isINode,
} from '../types'
import { BackendNodeGateway } from './BackendNodeGateway'
const bodyJsonParser = require('body-parser').json()

// eslint-disable-next-line new-cap
export const NodeExpressRouter = express.Router()

/**
 * NodeRouter uses NodeExpressRouter (an express router) to define responses
 * for specific HTTP requests at routes starting with '/node'.
 * E.g. a post request to '/node/create' would create a node.
 * The NodeRouter contains a BackendNodeGateway so that when an HTTP request
 * is received, the NodeRouter can call specific methods on BackendNodeGateway
 * to trigger the appropriate response. See server/src/app.ts to see how
 * we set up NodeRouter - you don't need to know the details of this just yet.
 */
export class NodeRouter {
  BackendNodeGateway: BackendNodeGateway

  constructor(mongoClient: MongoClient) {
    this.BackendNodeGateway = new BackendNodeGateway(mongoClient)

    /**
     * Request to create node
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    NodeExpressRouter.post('/create', async (req: Request, res: Response) => {
      try {
        const node = req.body.node
        if (!isINode(node)) {
          res.status(400).send('not INode!')
        } else {
          const response = await this.BackendNodeGateway.createNode(node)
          res.status(200).send(response)
        }
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to retrieve node by nodeId
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    NodeExpressRouter.get('/get/:nodeId', async (req: Request, res: Response) => {
      try {
        const nodeId = req.params.nodeId
        const response: IServiceResponse<INode> =
          await this.BackendNodeGateway.getNodeById(nodeId)
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    NodeExpressRouter.get('/search/:text', async (req: Request, res: Response) => {
      try {
        const { text } = req.params
        // TODO: find corresponding text nodes
        const resp = await this.BackendNodeGateway.searchNodes(text)
        console.log(resp)

        res.status(200).send(resp)
      } catch (e) {
        console.log(e)
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to retrieve node by lat lng
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    NodeExpressRouter.post(
      '/findNodeByLatLngAndId',
      async (req: Request, res: Response) => {
        try {
          const lat = Number(req.body.lat)
          const lng = Number(req.body.lng)
          const userId = req.body.userId
          const response: IServiceResponse<ILocNode> =
            await this.BackendNodeGateway.getNodeByLatLngAndId(lat, lng, userId)
          res.status(200).send(response)
        } catch (e) {
          res.status(500).send(e.message)
        }
      }
    )

    /**
     * Request to retrieve all loc nodes
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    NodeExpressRouter.get('/getAllLocNodes', async (req: Request, res: Response) => {
      try {
        const response: IServiceResponse<RecursiveNodeTree[]> =
          await this.BackendNodeGateway.fetchLocNodes()
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to retrieve all public nodes in square
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    NodeExpressRouter.get('/getAllPublicNodes', async (req: Request, res: Response) => {
      try {
        const response: IServiceResponse<RecursiveNodeTree[]> =
          await this.BackendNodeGateway.fetchPublicNodes()
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Requeset to fetch all nodes by userId
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    NodeExpressRouter.post('/fetchNodesByUserId', async (req: Request, res: Response) => {
      try {
        const userId = req.body.userId
        const resp: IServiceResponse<RecursiveNodeTree[]> =
          await this.BackendNodeGateway.fetchNodesByUserId(userId)
        res.status(200).send(resp)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to retrieve nodes by nodeIds
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    NodeExpressRouter.post('/getNodesById', async (req: Request, res: Response) => {
      try {
        const nodeIds = req.body.nodeIds
        const response: IServiceResponse<INode[]> =
          await this.BackendNodeGateway.getNodesById(nodeIds)
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to update the node with the given nodeId
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    NodeExpressRouter.put(
      '/:nodeId',
      bodyJsonParser,
      async (req: Request, res: Response) => {
        try {
          const nodeId = req.params.nodeId
          const toUpdate: INodeProperty[] = req.body.data
          const response = await this.BackendNodeGateway.updateNode(nodeId, toUpdate)
          res.status(200).send(response)
        } catch (e) {
          res.status(500).send(e.message)
        }
      }
    )

    /**
     * Request to move the node with the given nodeId to the given parentId
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    NodeExpressRouter.put(
      '/move/:nodeId/:newParentId',
      bodyJsonParser,
      async (req: Request, res: Response) => {
        try {
          const nodeId = req.params.nodeId
          const newParentId = req.params.newParentId
          const response = await this.BackendNodeGateway.moveNode(nodeId, newParentId)
          res.status(200).send(response)
        } catch (e) {
          res.status(500).send(e.message)
        }
      }
    )

    /**
     * Request to delete the node with the given nodeId
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    NodeExpressRouter.delete('/:nodeId', async (req: Request, res: Response) => {
      try {
        const nodeId = req.params.nodeId
        const response = await this.BackendNodeGateway.deleteNode(nodeId)
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to retrieve node with all its children
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    NodeExpressRouter.get('/root/:nodeId', async (req: Request, res: Response) => {
      try {
        const nodeId = req.params.nodeId
        const response: IServiceResponse<RecursiveNodeTree> =
          await this.BackendNodeGateway.getTreeByVertex(nodeId)
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Search Node
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */

    NodeExpressRouter.post('/search', async (req: Request, res: Response) => {
      try {
        const term = req.body.data
        const response: IServiceResponse<INode[]> =
          await this.BackendNodeGateway.searchTerm(term)
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to retrieve all nodes that does not have parent
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    NodeExpressRouter.get('/roots', async (req: Request, res: Response) => {
      try {
        const response: IServiceResponse<RecursiveNodeTree[]> =
          await this.BackendNodeGateway.getRoots()
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })
  }

  /**
   * @returns NodeRouter class
   */
  getExpressRouter = (): Router => {
    return NodeExpressRouter
  }
}
