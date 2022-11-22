import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { BackendAnchorGateway } from '../../../../anchors'
import { ITextExtent, makeIAnchor, makeITextExtent } from '../../../../types'

describe('Unit Test: deleteAnchorById', () => {
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

  beforeEach(async () => {
    const response = await backendAnchorGateway.deleteAll()
    expect(response.success).toBeTruthy()
  })

  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('deletes valid anchor', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const validAnchor = makeIAnchor('anchor1', 'node1', textExtent)
    const createResponse = await backendAnchorGateway.createAnchor(validAnchor)
    expect(createResponse.success).toBeTruthy()
    const deleteResp = await backendAnchorGateway.deleteAnchor('anchor1')
    expect(deleteResp.success).toBeTruthy()
    const getResp = await backendAnchorGateway.getAnchorById('anchor1')
    expect(getResp.success).toBeFalsy()
  })

  test('gives success when attempt to delete anchor id that does not exist', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const validAnchor = makeIAnchor('anchor1', 'node1', textExtent)
    const createResponse = await backendAnchorGateway.createAnchor(validAnchor)
    expect(createResponse.success).toBeTruthy()
    const deleteResp = await backendAnchorGateway.deleteAnchor('invalidId')
    expect(deleteResp.success).toBeTruthy()
  })
})
