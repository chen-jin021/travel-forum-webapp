import express, { Request, Response, Router } from 'express'
import { MongoClient } from 'mongodb'
import { IServiceResponse, isILink, ILink } from '../types'
import { BackendLinkGateway } from './BackendLinkGateway'

// eslint-disable-next-line new-cap
export const LinkExpressRouter = express.Router()

/**
 * LinkRouter uses LinkExpressRouter (an express router) to define responses
 * for specific HTTP requests at routes starting with '/link'.
 * E.g. a post request to '/link/create' would create a link.
 * The LinkRouter contains a BackendLinkGateway so that when an HTTP request
 * is received, the LinkRouter can call specific methods on BackendLinkGateway
 * to trigger the appropriate response. See server/src/app.ts to see how
 * we set up LinkRouter.
 */
export class LinkRouter {
  BackendLinkGateway: BackendLinkGateway

  constructor(mongoClient: MongoClient) {
    this.BackendLinkGateway = new BackendLinkGateway(mongoClient)

    /**
     * Request to create link
     * @param req request object coming from client
     * @param res response object to send to client
     */
    LinkExpressRouter.post('/create', async (req: Request, res: Response) => {
      try {
        const link = req.body.link
        if (!isILink(link)) {
          res.status(400).send('not valid ILink!')
        } else {
          const response = await this.BackendLinkGateway.createLink(link)
          res.status(200).send(response)
        }
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to retrieve links by anchorId
     * @param req request object coming from client
     * @param res response object to send to client
     */
    LinkExpressRouter.get(
      '/getByAnchorId/:anchorId',
      async (req: Request, res: Response) => {
        try {
          const anchorId = req.params.anchorId
          const response: IServiceResponse<ILink[]> =
            await this.BackendLinkGateway.getLinksByAnchorId(anchorId)
          res.status(200).send(response)
        } catch (e) {
          res.status(500).send(e.message)
        }
      }
    )

    /**
     * Request to retrieve links attached to a list of anchorIds
     * @param req request object coming from client
     * @param res response object to send to client
     */
    LinkExpressRouter.post('/getByAnchorIds', async (req: Request, res: Response) => {
      try {
        const anchorIds = req.body.anchorIds
        const response: IServiceResponse<ILink[]> =
          await this.BackendLinkGateway.getLinksByAnchorIds(anchorIds)
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to retrieve links attached to a list of anchorIds
     * @param req request object coming from client
     * @param res response object to send to client
     */
    LinkExpressRouter.post('/getLinksById', async (req: Request, res: Response) => {
      try {
        const linkIds = req.body.linkIds
        const response: IServiceResponse<ILink[]> =
          await this.BackendLinkGateway.getLinksById(linkIds)
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to retrieve links attached to a list of anchorIds
     * @param req request object coming from client
     * @param res response object to send to client
     */
    LinkExpressRouter.get('/getLinkById/:linkId', async (req: Request, res: Response) => {
      try {
        const linkId = req.params.linkId
        const response: IServiceResponse<ILink> =
          await this.BackendLinkGateway.getLinkById(linkId)
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to delete the link with the given linkId
     * @param req request object coming from client
     * @param res response object to send to client
     */
    LinkExpressRouter.delete('/:linkId', async (req: Request, res: Response) => {
      try {
        const linkId = req.params.linkId
        const response = await this.BackendLinkGateway.deleteLink(linkId)
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to delete the link with the given linkId
     * @param req request object coming from client
     * @param res response object to send to client
     */
    LinkExpressRouter.post('/delete', async (req: Request, res: Response) => {
      try {
        const linkIds = req.body.linkIds
        const response = await this.BackendLinkGateway.deleteLinks(linkIds)
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })
  }

  /**
   * @returns LinkRouter class
   */
  getExpressRouter = (): Router => {
    return LinkExpressRouter
  }
}
