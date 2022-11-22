import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { BackendAnchorGateway } from '../../../../anchors'
import {
  IImageExtent,
  ITextExtent,
  makeIAnchor,
  makeIImageExtent,
  makeITextExtent,
} from '../../../../types'

describe('Unit Test: deleteAll', () => {
  let uri
  let mongoClient
  let backendAnchorGateway
  let mongoMemoryServer

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create()
    uri = mongoMemoryServer.getUri()
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    backendAnchorGateway = new BackendAnchorGateway(mongoClient)
    mongoClient.connect()
  })

  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('successfully deletes all anchors', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const anchor1 = makeIAnchor('anchor1', 'node1', textExtent)
    const imageExtent: IImageExtent = makeIImageExtent(1, 2, 3, 4)
    const anchor2 = makeIAnchor('anchor2', 'node1', imageExtent)
    const response1 = await backendAnchorGateway.createAnchor(anchor1)
    const response2 = await backendAnchorGateway.createAnchor(anchor2)
    expect(response1.success).toBeTruthy()
    expect(response2.success).toBeTruthy()
    const response3 = await backendAnchorGateway.deleteAll()
    expect(response3.success).toBeTruthy()
    const response4 = await backendAnchorGateway.getAnchorById('anchor.1')
    expect(response4.success).toBeFalsy()
    const response5 = await backendAnchorGateway.getAnchorById('anchor.2')
    expect(response5.success).toBeFalsy()
  })
})
