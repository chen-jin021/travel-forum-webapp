import { LinkCollectionConnection } from '../../../../links'
import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { ILink, makeILink } from '../../../../types'

describe('Unit Test: findLinksById', () => {
  let uri
  let mongoClient
  let linkCollectionConnection
  let mongoMemoryServer

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create()
    uri = mongoMemoryServer.getUri()
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    linkCollectionConnection = new LinkCollectionConnection(mongoClient)
    mongoClient.connect()
  })

  beforeEach(async () => {
    const response = await linkCollectionConnection.clearLinkCollection()
    expect(response.success).toBeTruthy()
  })

  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('gets links when given valid ids', async () => {
    const validLink1: ILink = makeILink('link1', 'anchor1', 'anchor2', 'node1', 'node2')
    const validLink2: ILink = makeILink('link2', 'anchor2', 'anchor3', 'node1', 'node2')
    const createResponse1 = await linkCollectionConnection.insertLink(validLink1)
    const createResponse2 = await linkCollectionConnection.insertLink(validLink2)
    expect(createResponse1.success).toBeTruthy()
    expect(createResponse2.success).toBeTruthy()
    const findLinksByIdResp = await linkCollectionConnection.findLinksById([
      validLink1.linkId,
      validLink2.linkId,
    ])
    expect(findLinksByIdResp.success).toBeTruthy()
    expect(findLinksByIdResp.payload.length).toBe(2)
  })

  test('success when some links are not found', async () => {
    const validLink: ILink = makeILink('link1', 'anchor1', 'anchor2', 'node1', 'node2')
    const createResponse = await linkCollectionConnection.insertLink(validLink)
    expect(createResponse.success).toBeTruthy()
    const findLinksByIdResp = await linkCollectionConnection.findLinksById([
      'link1',
      'link2',
    ])
    expect(findLinksByIdResp.success).toBeTruthy()
    expect(findLinksByIdResp.payload.length).toBe(1)
  })

  test('success when links are not found', async () => {
    const validLink: ILink = makeILink('link1', 'anchor1', 'anchor2', 'node1', 'node2')
    const createResponse = await linkCollectionConnection.insertLink(validLink)
    expect(createResponse.success).toBeTruthy()
    const findLinksByIdResp = await linkCollectionConnection.findLinksById(['link2'])
    expect(findLinksByIdResp.success).toBeTruthy()
    expect(findLinksByIdResp.payload.length).toBe(0)
  })
})
