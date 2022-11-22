import { ITextExtent, makeIAnchor, makeITextExtent } from '../../../../types'
import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { AnchorCollectionConnection } from '../../../../anchors'

describe('Unit Test: deleteAnchor', () => {
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

  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('successfully deletes anchor', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const validAnchor = makeIAnchor('anchorId', 'nodeId', textExtent)
    const createResponse = await anchorCollectionConnection.insertAnchor(validAnchor)
    expect(createResponse.success).toBeTruthy()
    const deleteResponse = await anchorCollectionConnection.deleteAnchor(
      validAnchor.anchorId
    )
    expect(deleteResponse.success).toBeTruthy()
  })

  test('gives success if we try to delete anchor that does not exist', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const validAnchor = makeIAnchor('anchorId', 'nodeId', textExtent)
    const createResponse = await anchorCollectionConnection.insertAnchor(validAnchor)
    expect(createResponse.success).toBeTruthy()
    const deleteResponse = await anchorCollectionConnection.deleteAnchor(
      validAnchor.anchorId
    )
    expect(deleteResponse.success).toBeTruthy()
    const deleteFailureResponse = await anchorCollectionConnection.deleteAnchor(
      validAnchor.anchorId
    )
    expect(deleteFailureResponse.success).toBeTruthy()
  })
})
