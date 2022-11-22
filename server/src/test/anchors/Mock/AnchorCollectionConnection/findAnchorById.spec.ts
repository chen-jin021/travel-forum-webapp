import { ITextExtent, makeIAnchor, makeITextExtent } from '../../../../types'
import { AnchorCollectionConnection } from '../../../../anchors'
import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'

describe('Unit Test: findAnchorById', () => {
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

  test('gets anchor when given valid id', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const validAnchor = makeIAnchor('anchorId', 'nodeId', textExtent)
    const createResponse = await anchorCollectionConnection.insertAnchor(validAnchor)
    expect(createResponse.success).toBeTruthy()
    const findAnchorByIdResp = await anchorCollectionConnection.findAnchorById(
      validAnchor.anchorId
    )
    expect(findAnchorByIdResp.success).toBeTruthy()
  })

  test('fails to get anchor when given invalid id', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const validAnchor = makeIAnchor('anchorId', 'nodeId', textExtent)
    const createResponse = await anchorCollectionConnection.insertAnchor(validAnchor)
    expect(createResponse.success).toBeTruthy()
    const findAnchorByIdResp = await anchorCollectionConnection.findAnchorById(
      validAnchor.anchorId
    )
    expect(findAnchorByIdResp.success).toBeTruthy()
    const findAnchorByIdResp1 = await anchorCollectionConnection.findAnchorById('invalid')
    expect(findAnchorByIdResp1.success).toBeFalsy()
  })
})
