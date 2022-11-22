import { IAnchor, ITextExtent, makeIAnchor, makeITextExtent } from '../../../../types'
import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { AnchorCollectionConnection } from '../../../../anchors'

describe('Unit Test: InsertAnchor', () => {
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

  test('inserts valid anchor', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const validAnchor = makeIAnchor('anchorId', 'nodeId', textExtent)
    const response = await anchorCollectionConnection.insertAnchor(validAnchor)
    expect(response.success).toBeTruthy()
  })

  test('fails to insert invalid document with wrong shape', async () => {
    const invalidAnchor: any = { id: 'id' }
    const response = await anchorCollectionConnection.insertAnchor(invalidAnchor)
    expect(response.success).toBeFalsy()
  })

  test('fails to insert invalid document with correct shape', async () => {
    const invalidAnchor: IAnchor = makeIAnchor(undefined, undefined, undefined)
    const response = await anchorCollectionConnection.insertAnchor(invalidAnchor)
    expect(response.success).toBeFalsy()
  })
})
