import { MongoClient } from 'mongodb'
import {
  failureServiceResponse,
  IServiceResponse,
  successfulServiceResponse,
  IInvitation,
  isInvitation,
} from '../types'
import { InvitationCollectionConnection } from './InvitationCollectionConnection'

/**
 * BackendinvitationGateway handles requests from invitationRouter, and calls on methods
 * in invitationCollectionConnection to interact with the database. It contains
 * the complex logic to check whether the request is valid, before
 * modifying the database.
 *
 * Example:
 * Before insertion, BackendinvitationGateway.createinvitation() will check whether the database
 * already contains a invitation with the same invitationId, as well as the the validity of
 * invitation's file path. In comparison, the invitationCollectionConnection.insertinvitation()
 * method simply retrieves the invitation object, and inserts it into the database.
 */
export class BackendInvitationGateway {
  invitationCollectionConnection: InvitationCollectionConnection

  constructor(mongoClient: MongoClient, collectionName?: string) {
    this.invitationCollectionConnection = new InvitationCollectionConnection(
      mongoClient,
      collectionName ?? 'invitations'
    )
  }

  /**
   * Method to create a invitation and insert it into the database.
   *
   * @param invitationId - The invitationId of the invitation to be created.
   */
  async createInvitation(invitation: any): Promise<IServiceResponse<IInvitation>> {
    // check whether is valid invitation
    const isValidInvitation = isInvitation(invitation)
    if (!isValidInvitation) {
      return failureServiceResponse('Not a valid invitation.')
    }
    // check whether already in database
    const invitationResponse =
      await this.invitationCollectionConnection.findInvitationById(invitation.inviteId)
    if (invitationResponse.success) {
      return failureServiceResponse(
        'invitation with duplicate ID already exist in database.'
      )
    }

    // if everything checks out, insert invitation
    const insertinvitationResp =
      await this.invitationCollectionConnection.insertInvitation(invitation)
    return insertinvitationResp
  }

  /**
   * Method to retrieve invitation with a given inviteId.
   *
   * @param inviteId - The inviteId of the invitation to be retrieved.
   * @returns IServiceResponse<Iinvitation>
   */
  async getInvitationById(inviteId: string): Promise<IServiceResponse<IInvitation>> {
    return this.invitationCollectionConnection.findInvitationById(inviteId)
  }

  /**
   * Method to delete all invitations in the database.
   *
   * @returns IServiceResponse<{}>
   */
  async deleteAll(): Promise<IServiceResponse<{}>> {
    return await this.invitationCollectionConnection.clearinvitationCollection()
  }

  /**
   * Method to decline the invitation.
   *
   * @returns IServiceResponse<{}>
   */
  async decline(inviteId: string): Promise<IServiceResponse<{}>> {
    return await this.invitationCollectionConnection.deleteInvitation(inviteId)
  }

  /**
   * Method to get all sent invitations list by the user's id.
   *
   * @param userId the userId of the user
   */

  async fetchSentInvitesByUserId(
    userId: string
  ): Promise<IServiceResponse<IInvitation[]>> {
    const fetchinvitationsResp =
      await this.invitationCollectionConnection.fetchSentInvitesByUserId(userId)
    if (!fetchinvitationsResp.success) {
      return failureServiceResponse(fetchinvitationsResp.message)
    }
    return fetchinvitationsResp
  }

  /**
   * Method to get all received invitations list by the user's id.
   *
   * @param userId the userId of the user
   */

  async fetchRcvedInvitesByUserId(
    userId: string
  ): Promise<IServiceResponse<IInvitation[]>> {
    const fetchinvitationsResp =
      await this.invitationCollectionConnection.fetchRcvedInvitesByUserId(userId)
    if (!fetchinvitationsResp.success) {
      return failureServiceResponse(fetchinvitationsResp.message)
    }
    return fetchinvitationsResp
  }
}
