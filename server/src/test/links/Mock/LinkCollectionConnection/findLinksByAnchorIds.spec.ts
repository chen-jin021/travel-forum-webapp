import { ILink, isSameLink, makeILink } from '../../../../types'
import { LinkCollectionConnection } from '../../../../links'

import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'

describe('Unit Test: findLinksByAnchorId', () => {
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

  test('gets links when given valid anchorIds', async () => {
    const validLink1: ILink = makeILink('link1', 'anchor1', 'anchor2', 'node1', 'node2')
    const createResponse1 = await linkCollectionConnection.insertLink(validLink1)
    expect(createResponse1.success).toBeTruthy()
    const validLink2: ILink = makeILink('link2', 'anchor2', 'anchor1', 'node1', 'node2')
    const createResponse2 = await linkCollectionConnection.insertLink(validLink2)
    expect(createResponse2.success).toBeTruthy()
    const validLink3: ILink = makeILink('link3', 'anchor3', 'anchor2', 'node1', 'node2')
    const createResponse3 = await linkCollectionConnection.insertLink(validLink3)
    expect(createResponse3.success).toBeTruthy()
    const validLink4: ILink = makeILink('link4', 'anchor3', 'anchor1', 'node1', 'node2')
    const createResponse4 = await linkCollectionConnection.insertLink(validLink4)
    expect(createResponse4.success).toBeTruthy()
    const validLink5: ILink = makeILink('link5', 'anchor3', 'anchor4', 'node1', 'node2')
    const createResponse5 = await linkCollectionConnection.insertLink(validLink5)
    expect(createResponse5.success).toBeTruthy()
    const findLinkByAnchorIdResp = await linkCollectionConnection.findLinksByAnchorIds([
      'anchor1',
      'anchor2',
    ])
    expect(findLinkByAnchorIdResp.success).toBeTruthy()
    expect(findLinkByAnchorIdResp.payload.length).toBe(4)
    const link1 = findLinkByAnchorIdResp.payload.find((link) => link.linkId === 'link1')
    expect(isSameLink(link1, validLink1)).toBeTruthy()
    const link2 = findLinkByAnchorIdResp.payload.find((link) => link.linkId === 'link2')
    expect(isSameLink(link2, validLink2)).toBeTruthy()
    const link3 = findLinkByAnchorIdResp.payload.find((link) => link.linkId === 'link3')
    expect(isSameLink(link3, validLink3)).toBeTruthy()
    const link4 = findLinkByAnchorIdResp.payload.find((link) => link.linkId === 'link4')
    expect(isSameLink(link4, validLink4)).toBeTruthy()
  })

  test('gets links when given valid anchorIds', async () => {
    const validLink1: ILink = makeILink('link1', 'anchor1', 'anchor2', 'node1', 'node2')
    const createResponse1 = await linkCollectionConnection.insertLink(validLink1)
    expect(createResponse1.success).toBeTruthy()
    const validLink2: ILink = makeILink('link2', 'anchor2', 'anchor1', 'node1', 'node2')
    const createResponse2 = await linkCollectionConnection.insertLink(validLink2)
    expect(createResponse2.success).toBeTruthy()
    const validLink3: ILink = makeILink('link3', 'anchor3', 'anchor2', 'node1', 'node2')
    const createResponse3 = await linkCollectionConnection.insertLink(validLink3)
    expect(createResponse3.success).toBeTruthy()
    const validLink4: ILink = makeILink('link4', 'anchor3', 'anchor1', 'node1', 'node2')
    const createResponse4 = await linkCollectionConnection.insertLink(validLink4)
    expect(createResponse4.success).toBeTruthy()
    const validLink5: ILink = makeILink('link5', 'anchor3', 'anchor4', 'node1', 'node2')
    const createResponse5 = await linkCollectionConnection.insertLink(validLink5)
    expect(createResponse5.success).toBeTruthy()
    const findLinkByAnchorIdResp = await linkCollectionConnection.findLinksByAnchorIds([
      'anchor2',
      'anchor5',
    ])
    expect(findLinkByAnchorIdResp.success).toBeTruthy()
    expect(findLinkByAnchorIdResp.payload.length).toBe(3)
    const link1 = findLinkByAnchorIdResp.payload.find((link) => link.linkId === 'link1')
    expect(isSameLink(link1, validLink1)).toBeTruthy()
    const link2 = findLinkByAnchorIdResp.payload.find((link) => link.linkId === 'link2')
    expect(isSameLink(link2, validLink2)).toBeTruthy()
    const link3 = findLinkByAnchorIdResp.payload.find((link) => link.linkId === 'link3')
    expect(isSameLink(link3, validLink3)).toBeTruthy()
  })

  test('success with empty payload array when given invalid anchorIds', async () => {
    const validLink: ILink = makeILink('link1', 'anchor1', 'anchor2', 'node1', 'node2')
    const createResponse = await linkCollectionConnection.insertLink(validLink)
    expect(createResponse.success).toBeTruthy()
    const findLinkByIdResp = await linkCollectionConnection.findLinksByAnchorIds([
      'anchor3',
    ])
    expect(findLinkByIdResp.success).toBeTruthy()
    expect(findLinkByIdResp.payload.length).toBe(0)
  })
})
