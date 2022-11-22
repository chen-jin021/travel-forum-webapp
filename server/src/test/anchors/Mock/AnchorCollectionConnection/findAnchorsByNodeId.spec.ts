import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import {
  isSameAnchor,
  ITextExtent,
  makeIAnchor,
  makeITextExtent,
} from '../../../../types'
import { AnchorCollectionConnection } from '../../../../anchors'

describe('Unit Test: findAnchorByNodeId', () => {
  let uri
  let mongoClient
  let anchorCollectionConnection
  let mongoMemoryServer

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create()
    uri = mongoMemoryServer.getUri()
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    anchorCollectionConnection = new AnchorCollectionConnection(mongoClient)
    mongoClient.connect()
  })

  beforeEach(async () => {
    const response = await anchorCollectionConnection.clearAnchorCollection()
    expect(response.success).toBeTruthy()
  })

  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('gets anchors when given valid nodeId', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const validAnchor1 = makeIAnchor('anchorId1', 'nodeId', textExtent)
    const createResponse1 = await anchorCollectionConnection.insertAnchor(validAnchor1)
    expect(createResponse1.success).toBeTruthy()
    const validAnchor2 = makeIAnchor('anchorId2', 'nodeId', textExtent)
    const createResponse2 = await anchorCollectionConnection.insertAnchor(validAnchor2)
    expect(createResponse2.success).toBeTruthy()
    const findAnchorsByNodeIdResp = await anchorCollectionConnection.findAnchorsByNodeId(
      'nodeId'
    )
    expect(findAnchorsByNodeIdResp.success).toBeTruthy()
    expect(findAnchorsByNodeIdResp.payload.length).toBe(2)
    const anchor1 = findAnchorsByNodeIdResp.payload.find(
      (anchor) => anchor.anchorId === 'anchorId1'
    )
    expect(isSameAnchor(anchor1, validAnchor1)).toBeTruthy()
    const anchor2 = findAnchorsByNodeIdResp.payload.find(
      (anchor) => anchor.anchorId === 'anchorId2'
    )
    expect(isSameAnchor(anchor2, validAnchor2)).toBeTruthy()
  })

  test('returns empty array when no anchors were found', async () => {
    const findAnchorsByNodeIdResp = await anchorCollectionConnection.findAnchorsByNodeId(
      'nodeId'
    )
    expect(findAnchorsByNodeIdResp.success).toBeTruthy()
    expect(findAnchorsByNodeIdResp.payload.length).toBe(0)
  })
})
