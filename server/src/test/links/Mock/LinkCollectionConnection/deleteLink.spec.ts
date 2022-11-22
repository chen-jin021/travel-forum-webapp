import { ILink, makeILink } from '../../../../types'
import { LinkCollectionConnection } from '../../../../links'

import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'

describe('Unit Test: deleteLink', () => {
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

  test('successfully deletes link', async () => {
    const validLink: ILink = makeILink('link1', 'anchor1', 'anchor2', 'node1', 'node2')
    const createResponse = await linkCollectionConnection.insertLink(validLink)
    expect(createResponse.success).toBeTruthy()
    const deleteLinkResp = await linkCollectionConnection.deleteLink('link1')
    expect(deleteLinkResp.success).toBeTruthy()
  })

  test('gives success if we try to delete link that does not exist', async () => {
    const validLink: ILink = makeILink('link1', 'anchor1', 'anchor2', 'node1', 'node2')
    const createResponse = await linkCollectionConnection.insertLink(validLink)
    expect(createResponse.success).toBeTruthy()
    const deleteLinkResp = await linkCollectionConnection.deleteLink('link2')
    expect(deleteLinkResp.success).toBeTruthy()
  })
})
