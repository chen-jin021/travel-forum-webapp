import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { BackendLinkGateway } from '../../../../links'
import { ILink, makeILink } from '../../../../types'

describe('Unit Test: getLinkById', () => {
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

  test('gets link when given valid id', async () => {
    const validLink: ILink = makeILink('link1', 'anchor1', 'anchor2', 'node1', 'node2')
    const createResponse = await backendLinkGateway.createLink(validLink)
    expect(createResponse.success).toBeTruthy()
    const getLinkByIdResp = await backendLinkGateway.getLinkById('link1')
    expect(getLinkByIdResp.success).toBeTruthy()
  })

  test('fails to get link when given invalid id', async () => {
    const validLink: ILink = makeILink('link1', 'anchor1', 'anchor2', 'node1', 'node2')
    const createResponse = await backendLinkGateway.createLink(validLink)
    expect(createResponse.success).toBeTruthy()
    const getLinkByIdResp = await backendLinkGateway.getLinkById('link2')
    expect(getLinkByIdResp.success).toBeFalsy()
  })
})
