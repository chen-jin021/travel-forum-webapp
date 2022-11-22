import { ILink, makeILink } from '../../../../types'
import { LinkCollectionConnection } from '../../../../links'

import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'

describe('Unit Test: deleteLinks', () => {
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

  test('successfully deletes single link', async () => {
    const validLink: ILink = makeILink('link1', 'anchor1', 'anchor2', 'node1', 'node2')
    const createResponse = await linkCollectionConnection.insertLink(validLink)
    expect(createResponse.success).toBeTruthy()
    const deleteLinkResp = await linkCollectionConnection.deleteLinks(['link1'])
    expect(deleteLinkResp.success).toBeTruthy()
  })

  test('successfully deletes multiple links', async () => {
    const validLink1: ILink = makeILink('link1', 'anchor1', 'anchor2', 'node1', 'node2')
    const createResponse1 = await linkCollectionConnection.insertLink(validLink1)
    expect(createResponse1.success).toBeTruthy()
    const validLink2: ILink = makeILink('link2', 'anchor2', 'anchor3', 'node1', 'node2')
    const createResponse2 = await linkCollectionConnection.insertLink(validLink2)
    expect(createResponse2.success).toBeTruthy()
    const deleteLinkResp = await linkCollectionConnection.deleteLinks(['link1', 'link2'])
    expect(deleteLinkResp.success).toBeTruthy()
    const findLinkResp1 = await linkCollectionConnection.findLinkById('link1')
    expect(findLinkResp1.success).toBeFalsy()
    const findLinkResp2 = await linkCollectionConnection.findLinkById('link2')
    expect(findLinkResp2.success).toBeFalsy()
  })

  test('gives success if we try to delete links that ' + 'don\'t exist', async () => {
    const validLink: ILink = makeILink('link1', 'anchor1', 'anchor2', 'node1', 'node2')
    const createResponse = await linkCollectionConnection.insertLink(validLink)
    expect(createResponse.success).toBeTruthy()
    const deleteLinkResp = await linkCollectionConnection.deleteLinks(['link1', 'link2'])
    expect(deleteLinkResp.success).toBeTruthy()
    const findLinkResp = await linkCollectionConnection.findLinkById('link1')
    expect(findLinkResp.success).toBeFalsy()
  })
})
