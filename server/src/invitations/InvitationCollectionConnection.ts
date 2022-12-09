import {
  IInvitation,
  isInvitation,
  IServiceResponse,
  failureServiceResponse,
  successfulServiceResponse,
} from '../types'
import { MongoClient } from 'mongodb'

/**
 * invitationCollectionConnection acts as an in-between communicator between
 * the MongoDB database and BackendinvitationGateway. invitationCollectionConnection
 * defines methods that interact directly with MongoDB. That said,
 * it does not include any of the complex logic that BackendinvitationGateway has.
 *
 * For example:
 * invitationCollectionConnection.deleteinvitation() will only delete a single invitation.
 * BackendinvitationGateway.deleteinvitation() deletes all its children from the database
 * as well.
 *
 * @param {MongoClient} client
 * @param {string} collectionName
 */
export class InvitationCollectionConnection {
  client: MongoClient
  collectionName: string

  constructor(mongoClient: MongoClient, collectionName?: string) {
    this.client = mongoClient
    this.collectionName = collectionName ?? 'invitations'
  }

  /**
   * Inserts a new invitation into the database
   * Returns successfulServiceResponse with Iinvitation that was inserted as the payload
   *
   * @param {IInvitation} invitation
   * @return successfulServiceResponse<Iinvitation>
   */
  async insertInvitation(
    invitation: IInvitation
  ): Promise<IServiceResponse<IInvitation>> {
    if (!isInvitation(invitation)) {
      return failureServiceResponse(
        'Failed to insert invitation due to improper input ' +
          'to invitationCollectionConnection.insertInvitation'
      )
    }
    const insertResponse = await this.client
      .db()
      .collection(this.collectionName)
      .insertOne(invitation)
    if (insertResponse.insertedCount) {
      return successfulServiceResponse(insertResponse.ops[0])
    }
    return failureServiceResponse(
      'Failed to insert invitation, insertCount: ' + insertResponse.insertedCount
    )
  }

  /**
   * Clears the entire invitation collection in the database.
   *
   * @return successfulServiceResponse on success
   *         failureServiceResponse on failure
   */
  async clearinvitationCollection(): Promise<IServiceResponse<{}>> {
    const response = await this.client.db().collection(this.collectionName).deleteMany({})
    if (response.result.ok) {
      return successfulServiceResponse({})
    }
    return failureServiceResponse('Failed to clear invitation collection.')
  }

  /**
   * Finds the invitation by inviteId
   *
   * @param {string} invitationId
   * @return successfulServiceResponse<Iinvitation> on success
   *         failureServiceResponse on failure
   */
  async findInvitationById(inviteId: string): Promise<IServiceResponse<IInvitation>> {
    const findResponse = await this.client
      .db()
      .collection(this.collectionName)
      .findOne({ inviteId: inviteId })
    if (findResponse == null) {
      return failureServiceResponse('Failed to find invitation with this invitationId.')
    } else {
      return successfulServiceResponse(findResponse)
    }
  }

  /*
   * Get the list of all invitations sent by the user with given userId
   * @return successfulServiceResponse<IInvitation[]> on success
   *         failureServiceResponse on failure
   */
  async fetchSentInvitesByUserId(
    userId: string
  ): Promise<IServiceResponse<IInvitation[]>> {
    const invitations: IInvitation[] = []
    await this.client
      .db()
      .collection(this.collectionName)
      .find({ senderId: userId })
      .forEach(function(invitation) {
        const validinvitation = isInvitation(invitation)
        if (validinvitation) {
          invitations.push(invitation)
        }
      })
    return successfulServiceResponse(invitations)
  }

  /*
   * Get the list of all invitations received by the user with given userId
   * @return successfulServiceResponse<IInvitation[]> on success
   *         failureServiceResponse on failure
   */
  async fetchRcvedInvitesByUserId(
    userId: string
  ): Promise<IServiceResponse<IInvitation[]>> {
    const invitations: IInvitation[] = []
    await this.client
      .db()
      .collection(this.collectionName)
      .find({ rcverId: userId })
      .forEach(function(invitation) {
        const validinvitation = isInvitation(invitation)
        if (validinvitation) {
          invitations.push(invitation)
        }
      })
    return successfulServiceResponse(invitations)
  }

  /**
   * Deletes the invitation with the given invitationId.
   *
   * @param {string} invitationId
   * @return successfulServiceResponse<Iinvitation> on success
   *         failureServiceResponse on failure
   */
  async deleteInvitation(inviteId: string): Promise<IServiceResponse<{}>> {
    const collection = await this.client.db().collection(this.collectionName)
    const deleteResponse = await collection.deleteOne({ inviteId: inviteId })
    if (deleteResponse.result.ok) {
      return successfulServiceResponse({})
    }
    return failureServiceResponse('Failed to delete')
  }
}
