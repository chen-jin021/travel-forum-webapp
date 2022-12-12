import express, { Request, Response, Router } from 'express'
import { MongoClient } from 'mongodb'
import { IServiceResponse, isIMessage, IMessage } from '../types'
import { BackendMessageGateway } from './BackendMessageGateway'

// eslint-disable-next-line new-cap
export const MessageExpressRouter = express.Router()

/**
 * MessageRouter uses MessageExpressRouter (an express router) to define responses
 * for specific HTTP requests at routes starting with '/Message'.
 * E.g. a post request to '/Message/create' would create a Message.
 * The MessageRouter contains a BackendMessageGateway so that when an HTTP request
 * is received, the MessageRouter can call specific methods on BackendMessageGateway
 * to trigger the appropriate response. See server/src/app.ts to see how
 * we set up MessageRouter.
 */
export class MessageRouter {
  BackendMessageGateway: BackendMessageGateway

  constructor(mongoClient: MongoClient) {
    this.BackendMessageGateway = new BackendMessageGateway(mongoClient)

    /**
     * Request to create message
     * @param req request object coming from client
     * @param res response object to send to client
     */
    MessageExpressRouter.post('/create', async (req: Request, res: Response) => {
      try {
        const message = req.body.message
        if (!isIMessage(message)) {
          res.status(400).send('not IMessage!')
        } else {
          const response = await this.BackendMessageGateway.createMessage(message)
          res.status(200).send(response)
        }
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to retrieve Message by MessageId
     * @param req request object coming from client
     * @param res response object to send to client
     */
    MessageExpressRouter.get('/:messageId', async (req: Request, res: Response) => {
      try {
        const messageId = req.params.messageId
        const response: IServiceResponse<IMessage> =
          await this.BackendMessageGateway.getMessageById(messageId)
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to retrieve messages by nodeId
     * @param req request object coming from client
     * @param res response object to send to client
     */
    MessageExpressRouter.get(
      '/getByNodeId/:nodeId',
      async (req: Request, res: Response) => {
        try {
          const nodeId = req.params.nodeId
          const response: IServiceResponse<IMessage[]> =
            await this.BackendMessageGateway.getMessagesByNodeId(nodeId)
          res.status(200).send(response)
        } catch (e) {
          res.status(500).send(e.message)
        }
      }
    )

    /**
     * Request to retrieve all messages
     * @param req request object coming from client
     * @param res response object to send to client
     */
    MessageExpressRouter.get('/getAllMsgs', async (req: Request, res: Response) => {
      try {
        const response: IServiceResponse<IMessage[]> =
          await this.BackendMessageGateway.fetchAllMessages()
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to delete the Message with the given MessageId
     * @param req request object coming from client
     * @param res response object to send to client
     */
    MessageExpressRouter.delete('/:messageId', async (req: Request, res: Response) => {
      try {
        const messageId = req.params.messageId
        const response = await this.BackendMessageGateway.deleteMessage(messageId)
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })
  }

  /**
   * @returns MessageRouter class
   */
  getExpressRouter = (): Router => {
    return MessageExpressRouter
  }
}
