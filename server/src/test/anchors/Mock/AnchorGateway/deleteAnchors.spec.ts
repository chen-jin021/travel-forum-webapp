import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { BackendAnchorGateway } from '../../../../anchors'
import { ITextExtent, makeIAnchor, makeITextExtent } from '../../../../types'

describe('Unit Test: deleteAnchors', () => {
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

  test('deletes valid anchors', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const validAnchor1 = makeIAnchor('anchor1', 'node1', textExtent)
    const createResponse1 = await backendAnchorGateway.createAnchor(validAnchor1)
    expect(createResponse1.success).toBeTruthy()
    const validAnchor2 = makeIAnchor('anchor2', 'node1', textExtent)
    const createResponse2 = await backendAnchorGateway.createAnchor(validAnchor2)
    expect(createResponse2.success).toBeTruthy()
    const deleteResp = await backendAnchorGateway.deleteAnchors(['anchor1', 'anchor2'])
    expect(deleteResp.success).toBeTruthy()
    const getResp1 = await backendAnchorGateway.getAnchorById('anchor1')
    expect(getResp1.success).toBeFalsy()
    const getResp2 = await backendAnchorGateway.getAnchorById('anchor2')
    expect(getResp2.success).toBeFalsy()
  })

  test('success when some anchorids do not exist', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const validAnchor = makeIAnchor('anchor1', 'node1', textExtent)
    const createResponse = await backendAnchorGateway.createAnchor(validAnchor)
    expect(createResponse.success).toBeTruthy()
    const deleteResp = await backendAnchorGateway.deleteAnchors(['invalidId', 'anchor1'])
    expect(deleteResp.success).toBeTruthy()
  })

  test('success when all anchorids do not exist', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const validAnchor = makeIAnchor('anchor1', 'node1', textExtent)
    const createResponse = await backendAnchorGateway.createAnchor(validAnchor)
    expect(createResponse.success).toBeTruthy()
    const deleteResp = await backendAnchorGateway.deleteAnchors(['invalidId'])
    expect(deleteResp.success).toBeTruthy()
  })
})
