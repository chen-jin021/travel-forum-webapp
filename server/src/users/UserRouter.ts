import express, { Request, Response, Router } from 'express'
import { MongoClient } from 'mongodb'
import { IUser, IServiceResponse, isIUser } from '../types' // IUserproperty
import { BackendUserGateway } from './BackenduserGateway'
const bodyJsonParser = require('body-parser').json()

// eslint-disable-next-line new-cap
export const userExpressRouter = express.Router()

/**
 * userRouter uses userExpressRouter (an express router) to define responses
 * for specific HTTP requests at routes starting with '/user'.
 * E.g. a post request to '/user/create' would create a user.
 * The userRouter contains a BackenduserGateway so that when an HTTP request
 * is received, the userRouter can call specific methods on BackenduserGateway
 * to trigger the appropriate response. See server/src/app.ts to see how
 * we set up userRouter - you don't need to know the details of this just yet.
 */
export class userRouter {
  BackendUserGateway: BackendUserGateway

  constructor(mongoClient: MongoClient) {
    this.BackendUserGateway = new BackendUserGateway(mongoClient)

    /**
     * Request to create user
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    userExpressRouter.post('/create', async (req: Request, res: Response) => {
      try {
        const user = req.body.user
        if (!isIUser(user)) {
          res.status(400).send('not IUser!')
        } else {
          const response = await this.BackendUserGateway.createUser(user)
          res.status(200).send(response)
        }
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to retrieve user by userId
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    userExpressRouter.get('/get/:userId', async (req: Request, res: Response) => {
      try {
        const userId = req.params.userId
        const response: IServiceResponse<IUser> =
          await this.BackendUserGateway.getUserById(userId)
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })
  }
}
