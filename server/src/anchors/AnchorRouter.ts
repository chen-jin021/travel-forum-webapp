import express, { Request, Response, Router } from 'express'
import { MongoClient } from 'mongodb'
import { IServiceResponse, isIAnchor, IAnchor } from '../types'
import { BackendAnchorGateway } from './BackendAnchorGateway'

// eslint-disable-next-line new-cap
export const AnchorExpressRouter = express.Router()

/**
 * AnchorRouter uses AnchorExpressRouter (an express router) to define responses
 * for specific HTTP requests at routes starting with '/anchor'.
 * E.g. a post request to '/anchor/create' would create a anchor.
 * The AnchorRouter contains a BackendAnchorGateway so that when an HTTP request
 * is received, the AnchorRouter can call specific methods on BackendAnchorGateway
 * to trigger the appropriate response. See server/src/app.ts to see how
 * we set up AnchorRouter.
 */
export class AnchorRouter {
  BackendAnchorGateway: BackendAnchorGateway

  constructor(mongoClient: MongoClient) {
    this.BackendAnchorGateway = new BackendAnchorGateway(mongoClient)

    /**
     * Request to create anchor
     * @param req request object coming from client
     * @param res response object to send to client
     */
    AnchorExpressRouter.post('/create', async (req: Request, res: Response) => {
      try {
        const anchor = req.body.anchor
        if (!isIAnchor(anchor)) {
          res.status(400).send('not IAnchor!')
        } else {
          const response = await this.BackendAnchorGateway.createAnchor(anchor)
          res.status(200).send(response)
        }
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to retrieve anchor by anchorId
     * @param req request object coming from client
     * @param res response object to send to client
     */
    AnchorExpressRouter.get('/:anchorId', async (req: Request, res: Response) => {
      try {
        const anchorId = req.params.anchorId
        const response: IServiceResponse<IAnchor> =
          await this.BackendAnchorGateway.getAnchorById(anchorId)
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to retrieve anchors by nodeId
     * @param req request object coming from client
     * @param res response object to send to client
     */
    AnchorExpressRouter.post('/getAnchorsById', async (req: Request, res: Response) => {
      try {
        const anchorIds = req.body.anchorIds
        const response: IServiceResponse<IAnchor[]> =
          await this.BackendAnchorGateway.getAnchorsById(anchorIds)
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to retrieve anchors by nodeId
     * @param req request object coming from client
     * @param res response object to send to client
     */
    AnchorExpressRouter.get(
      '/getByNodeId/:nodeId',
      async (req: Request, res: Response) => {
        try {
          const nodeId = req.params.nodeId
          const response: IServiceResponse<IAnchor[]> =
            await this.BackendAnchorGateway.getAnchorsByNodeId(nodeId)
          res.status(200).send(response)
        } catch (e) {
          res.status(500).send(e.message)
        }
      }
    )

    /**
     * Request to delete the anchor with the given anchorId
     * @param req request object coming from client
     * @param res response object to send to client
     */
    AnchorExpressRouter.delete('/:anchorId', async (req: Request, res: Response) => {
      try {
        const anchorId = req.params.anchorId
        const response = await this.BackendAnchorGateway.deleteAnchor(anchorId)
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to delete the anchor with the given anchorId
     * @param req request object coming from client
     * @param res response object to send to client
     */
    AnchorExpressRouter.post('/delete', async (req: Request, res: Response) => {
      try {
        const anchorIds = req.body.anchorIds
        const response = await this.BackendAnchorGateway.deleteAnchors(anchorIds)
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to update the anchor extent of a node with the given anchorId
     * @param req request object coming from client
     * @param res response object to send to client
     */
    AnchorExpressRouter.post('/updateExtent', async (req: Request, res: Response) => {
      try {
        const anchorId = req.body.anchorId
        const extent = req.body.extent
        const response = await this.BackendAnchorGateway.updateExtent(anchorId, extent)
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })
  }

  /**
   * @returns AnchorRouter class
   */
  getExpressRouter = (): Router => {
    return AnchorExpressRouter
  }
}
