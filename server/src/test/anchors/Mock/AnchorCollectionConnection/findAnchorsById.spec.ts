import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { ITextExtent, makeIAnchor, makeITextExtent } from '../../../../types'
import { AnchorCollectionConnection } from '../../../../anchors'

describe('Unit Test: findAnchorsById', () => {
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

  test('gets anchors when given valid ids', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const validAnchor = makeIAnchor('anchorId', 'nodeId', textExtent)
    const createResponse = await anchorCollectionConnection.insertAnchor(validAnchor)
    expect(createResponse.success).toBeTruthy()
    const textExtent1: ITextExtent = makeITextExtent('text', 1, 3)
    const validAnchor1 = makeIAnchor('anchorId1', 'nodeId', textExtent1)
    const createResponse1 = await anchorCollectionConnection.insertAnchor(validAnchor1)
    expect(createResponse1.success).toBeTruthy()
    const findAnchorByIdResp = await anchorCollectionConnection.findAnchorsById([
      validAnchor.anchorId,
      validAnchor1.anchorId,
    ])
    expect(findAnchorByIdResp.success).toBeTruthy()
    expect(findAnchorByIdResp.payload.length).toBe(2)
  })

  test('success when some anchors are not found', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const validAnchor = makeIAnchor('anchorId', 'nodeId', textExtent)
    const createResponse = await anchorCollectionConnection.insertAnchor(validAnchor)
    expect(createResponse.success).toBeTruthy()
    const findAnchorByIdResp = await anchorCollectionConnection.findAnchorsById([
      validAnchor.anchorId,
      'invalidId',
    ])
    expect(findAnchorByIdResp.success).toBeTruthy()
    expect(findAnchorByIdResp.payload.length).toBe(1)
  })

  test('success when anchors are not found', async () => {
    const findAnchorsByIdResp = await anchorCollectionConnection.findAnchorsById([
      'invalidId',
    ])
    expect(findAnchorsByIdResp.success).toBeTruthy()
    expect(findAnchorsByIdResp.payload.length).toBe(0)
  })
})
