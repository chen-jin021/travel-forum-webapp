import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { AnchorCollectionConnection } from '../../../../anchors'
import {
  IImageExtent,
  ITextExtent,
  makeIAnchor,
  makeIImageExtent,
  makeITextExtent,
} from '../../../../types'

describe('Unit Test: ClearAnchorCollection', () => {
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

  test('successfully deletes all anchors', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const anchor1 = makeIAnchor('anchor.1', 'node.1', textExtent)
    const imageExtent: IImageExtent = makeIImageExtent(1, 2, 3, 4)
    const anchor2 = makeIAnchor('anchor.2', 'node.1', imageExtent)
    const response1 = await anchorCollectionConnection.insertAnchor(anchor1)
    const response2 = await anchorCollectionConnection.insertAnchor(anchor2)
    expect(response1.success).toBeTruthy()
    expect(response2.success).toBeTruthy()
    const response3 = await anchorCollectionConnection.clearAnchorCollection()
    expect(response3.success).toBeTruthy()
    const response4 = await anchorCollectionConnection.findAnchorById('anchor.1')
    expect(response4.success).toBeFalsy()
    const response5 = await anchorCollectionConnection.findAnchorById('anchor.2')
    expect(response5.success).toBeFalsy()
  })
})
