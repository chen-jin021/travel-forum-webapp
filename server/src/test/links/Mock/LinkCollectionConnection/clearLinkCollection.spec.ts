import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { LinkCollectionConnection } from '../../../../links'
import { ILink, makeILink } from '../../../../types'

describe('Unit Test: ClearLinkCollection', () => {
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

  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('successfully deletes all links', async () => {
    const validLink1: ILink = makeILink('link1', 'anchor1', 'anchor2', 'node1', 'node2')
    const response1 = await linkCollectionConnection.insertLink(validLink1)
    expect(response1.success).toBeTruthy()

    const validLink2: ILink = makeILink('link2', 'anchor2', 'anchor3', 'node1', 'node2')
    const response2 = await linkCollectionConnection.insertLink(validLink2)
    expect(response2.success).toBeTruthy()

    const validLink3: ILink = makeILink('link3', 'anchor2', 'anchor1', 'node1', 'node2')
    const response3 = await linkCollectionConnection.insertLink(validLink3)
    expect(response3.success).toBeTruthy()

    const deleteAllResp = await linkCollectionConnection.clearLinkCollection()
    expect(deleteAllResp.success).toBeTruthy()

    const findLink1Resp = await linkCollectionConnection.findLinkById('1')
    expect(findLink1Resp.success).toBeFalsy()
    const findLink2Resp = await linkCollectionConnection.findLinkById('2')
    expect(findLink2Resp.success).toBeFalsy()
    const findLink3Resp = await linkCollectionConnection.findLinkById('3')
    expect(findLink3Resp.success).toBeFalsy()
  })
})
