import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { BackendAnchorGateway } from '../../../../anchors'
import { ITextExtent, makeIAnchor, makeITextExtent } from '../../../../types'

describe('Unit Test: getAnchorById', () => {
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

  test('gets anchor when given valid id', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const validAnchor = makeIAnchor('anchor1', 'node1', textExtent)
    const createResponse = await backendAnchorGateway.createAnchor(validAnchor)
    expect(createResponse.success).toBeTruthy()
    const getAnchorByIdResp = await backendAnchorGateway.getAnchorById(
      validAnchor.anchorId
    )
    expect(getAnchorByIdResp.success).toBeTruthy()
  })

  test('fails to get anchor when given invalid id', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const validAnchor = makeIAnchor('anchor1', 'node1', textExtent)
    const createResponse = await backendAnchorGateway.createAnchor(validAnchor)
    expect(createResponse.success).toBeTruthy()
    const getAnchorByIdResp = await backendAnchorGateway.getAnchorById('anchor2')
    expect(getAnchorByIdResp.success).toBeFalsy()
  })
})
