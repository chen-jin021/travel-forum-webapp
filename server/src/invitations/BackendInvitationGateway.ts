import { MongoClient } from 'mongodb'
import {
  failureServiceResponse,
  IServiceResponse,
  successfulServiceResponse,
  IInvitation,
  isInvitation,
  ILocNode,
  INode,
  INodeProperty,
  makeINodeProperty,
} from '../types'
import { InvitationCollectionConnection } from './InvitationCollectionConnection'
import { UserCollectionConnection } from '../users'
import { NodeCollectionConnection } from '../nodes'
import { read, readlink } from 'fs'

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
  userCollectionConnection: UserCollectionConnection
  nodeCollectionConnection: NodeCollectionConnection

  constructor(mongoClient: MongoClient, collectionName?: string) {
    this.invitationCollectionConnection = new InvitationCollectionConnection(
      mongoClient,
      collectionName ?? 'invitations'
    )
    this.userCollectionConnection = new UserCollectionConnection(
      mongoClient,
      collectionName ?? 'users'
    )
    this.nodeCollectionConnection = new NodeCollectionConnection(
      mongoClient,
      collectionName ?? 'nodes'
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

    // check whether already has the same invitation
    const inviteWithPropRsp =
      await this.invitationCollectionConnection.findInvitationByProps(
        invitation.nodeId,
        invitation.senderId,
        invitation.rcverId
      )

    if (inviteWithPropRsp.success) {
      return failureServiceResponse('You have sent one invitation on this location!')
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

  /**
   * Method to accept the invitation by the inviteId.
   *
   * @param inviteId the inviteId of the invitation
   */

  async acceptInvitationById(inviteId: string): Promise<IServiceResponse<{}>> {
    // 1. get Invitation by inviteId
    const getInvitationsResp =
      await this.invitationCollectionConnection.findInvitationById(inviteId)
    if (!getInvitationsResp.success) {
      return failureServiceResponse(getInvitationsResp.message)
    }

    // 2. delete the Invitation from database
    const declineInvitationResp = await this.decline(inviteId)
    if (!declineInvitationResp.success) {
      return failureServiceResponse(declineInvitationResp.message)
    }

    // 3. get the node by nodeId in invitation
    const nodeId = getInvitationsResp.payload.nodeId
    const getNodeResp: IServiceResponse<INode> =
      await this.nodeCollectionConnection.findNodeById(nodeId)
    if (!declineInvitationResp.success) {
      return failureServiceResponse(getNodeResp.message)
    }
    const node = getNodeResp.payload
    const locNode = node as ILocNode

    // 4. get the Invitation type (write/ read) and receiver's userId from the invitation
    const inviteType = getInvitationsResp.payload.type
    const rcverId = getInvitationsResp.payload.rcverId
    // 5. construct the new property, push the receiver's userId into the list
    let property: INodeProperty
    if (inviteType == 'read') {
      const readList = locNode.userReadIds
      readList.push(rcverId)
      property = makeINodeProperty('userReadIds', readList)
    } else if (inviteType == 'write') {
      const writeList = locNode.userWriteIds
      writeList.push(rcverId)
      property = makeINodeProperty('userWriteIds', writeList)
    }

    const propertyDic: any = {}
    const fieldName = property.fieldName
    const value = property.value
    propertyDic[fieldName] = value

    // 6. update Node with corresponding nodeId and the constructed property
    const updateNodeResp: IServiceResponse<{}> =
      await this.nodeCollectionConnection.updateNode(nodeId, propertyDic)
    return updateNodeResp
  }
}
