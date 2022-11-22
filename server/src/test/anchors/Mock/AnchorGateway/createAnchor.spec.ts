import { IAnchor, ITextExtent, makeIAnchor, makeITextExtent } from '../../../../types'
import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { BackendAnchorGateway } from '../../../../anchors'

describe('Unit Test: createAnchor', () => {
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

  test('creates valid anchor', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const validAnchor = makeIAnchor('anchorId', 'nodeId', textExtent)
    const response = await backendAnchorGateway.createAnchor(validAnchor)
    expect(response.success).toBeTruthy()
  })

  test('fails to create invalid document with wrong shape', async () => {
    const invalidAnchor: any = { id: 'id' }
    const response = await backendAnchorGateway.createAnchor(invalidAnchor)
    expect(response.success).toBeFalsy()
  })

  test('fails to create invalid document with correct shape', async () => {
    const invalidAnchor: IAnchor = makeIAnchor(undefined, undefined, undefined)
    const response = await backendAnchorGateway.createAnchor(invalidAnchor)
    expect(response.success).toBeFalsy()
  })
})
