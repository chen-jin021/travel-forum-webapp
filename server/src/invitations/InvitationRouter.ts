import express, { Request, response, Response, Router } from 'express'
import { MongoClient } from 'mongodb'
import { IInvitation, IServiceResponse, isInvitation } from '../types'
import { BackendInvitationGateway } from './BackendInvitationGateway'
const bodyJsonParser = require('body-parser').json()

// eslint-disable-next-line new-cap
export const invitationExpressRouter = express.Router()

/**
 * invitationRouter uses invitationExpressRouter (an express router) to define responses
 * for specific HTTP requests at routes starting with '/invitation'.
 * E.g. a post request to '/invitation/create' would create a invitation.
 * The invitationRouter contains a BackendinvitationGateway so that when an HTTP request
 * is received, the invitationRouter can call specific methods on BackendinvitationGateway
 * to trigger the appropriate response. See server/src/app.ts to see how
 * we set up invitationRouter - you don't need to know the details of this just yet.
 */
export class invitationRouter {
  BackendInvitationGateway: BackendInvitationGateway

  constructor(mongoClient: MongoClient) {
    this.BackendInvitationGateway = new BackendInvitationGateway(mongoClient)

    /**
     * Request to create invitation
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    invitationExpressRouter.post('/create', async (req: Request, res: Response) => {
      try {
        const invitation = req.body.invitation
        if (!isInvitation(invitation)) {
          res.status(400).send('not IInvitation!')
        } else {
          const response = await this.BackendInvitationGateway.createInvitation(
            invitation
          )
          res.status(200).send(response)
        }
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to retrieve invitation by inviteId
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    invitationExpressRouter.get('/get/:inviteId', async (req: Request, res: Response) => {
      try {
        const inviteId = req.params.inviteId
        const response: IServiceResponse<IInvitation> =
          await this.BackendInvitationGateway.getInvitationById(inviteId)
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to retrieve invitations list sent by a user with given userId
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    invitationExpressRouter.post(
      '/getSentInvitesByUserId',
      async (req: Request, res: Response) => {
        try {
          const userId = req.body.userId
          const response: IServiceResponse<IInvitation[]> =
            await this.BackendInvitationGateway.fetchSentInvitesByUserId(userId)
          res.status(200).send(response)
        } catch (e) {
          res.status(500).send(e.message)
        }
      }
    )

    /**
     * Request to retrieve invitations list received by a user with given userId
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    invitationExpressRouter.post(
      '/getRcvInvitesByUserId',
      async (req: Request, res: Response) => {
        try {
          const userId = req.body.userId
          const response: IServiceResponse<IInvitation[]> =
            await this.BackendInvitationGateway.fetchRcvedInvitesByUserId(userId)
          res.status(200).send(response)
        } catch (e) {
          res.status(500).send(e.message)
        }
      }
    )

    /**
     * Request to decline the invitation with the given invitationId
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    invitationExpressRouter.delete('/:inviteId', async (req: Request, res: Response) => {
      try {
        const inviteId = req.params.inviteId
        const response = await this.BackendInvitationGateway.decline(inviteId)
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })
  }

  /**
   * @returns invitationRouter class
   */
  getExpressRouter = (): Router => {
    return invitationExpressRouter
  }
}
