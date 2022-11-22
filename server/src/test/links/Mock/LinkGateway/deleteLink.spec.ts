import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { BackendLinkGateway } from '../../../../links'
import { ILink, makeILink } from '../../../../types'

describe('Unit Test: Delete Link By Id', () => {
  let uri
  let mongoClient
  let backendLinkGateway
  let mongoMemoryServer

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create()
    uri = mongoMemoryServer.getUri()
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    backendLinkGateway = new BackendLinkGateway(mongoClient)
    mongoClient.connect()
  })

  beforeEach(async () => {
    const response = await backendLinkGateway.deleteAll()
    expect(response.success).toBeTruthy()
  })

  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('deletes link', async () => {
    const validLink1: ILink = makeILink('link1', 'anchor1', 'anchor2', 'node1', 'node2')
    const response1 = await backendLinkGateway.createLink(validLink1)
    expect(response1.success).toBeTruthy()
    const deleteResp = await backendLinkGateway.deleteLink('link1')
    expect(deleteResp.success).toBeTruthy()
    const getResp = await backendLinkGateway.getLinkById('link1')
    expect(getResp.success).toBeFalsy()
  })

  test('gives success when link id does not exist', async () => {
    const validLink1: ILink = makeILink('link1', 'anchor1', 'anchor2', 'node1', 'node2')
    const createResponse = await backendLinkGateway.createLink(validLink1)
    expect(createResponse.success).toBeTruthy()
    const deleteResp = await backendLinkGateway.deleteLink('link2')
    expect(deleteResp.success).toBeTruthy()
  })
})
