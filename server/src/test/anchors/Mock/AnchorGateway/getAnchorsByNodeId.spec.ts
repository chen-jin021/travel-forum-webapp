import {
  isSameAnchor,
  ITextExtent,
  makeIAnchor,
  makeITextExtent,
} from '../../../../types'
import { BackendAnchorGateway } from '../../../../anchors'

import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'

describe('Unit Test: getAnchorsByNodeId', () => {
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

  test('gets anchors when given valid nodeId', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const validAnchor1 = makeIAnchor('anchor1', 'node1', textExtent)
    const createResponse1 = await backendAnchorGateway.createAnchor(validAnchor1)
    expect(createResponse1.success).toBeTruthy()
    const validAnchor2 = makeIAnchor('anchor2', 'node1', textExtent)
    const createResponse2 = await backendAnchorGateway.createAnchor(validAnchor2)
    expect(createResponse2.success).toBeTruthy()
    const validAnchor3 = makeIAnchor('anchor3', 'node1', textExtent)
    const createResponse3 = await backendAnchorGateway.createAnchor(validAnchor3)
    expect(createResponse3.success).toBeTruthy()
    const validAnchor4 = makeIAnchor('anchor4', 'node2', textExtent)
    const createResponse4 = await backendAnchorGateway.createAnchor(validAnchor4)
    expect(createResponse4.success).toBeTruthy()
    const getAnchorByAnchorIdResp = await backendAnchorGateway.getAnchorsByNodeId('node1')
    expect(getAnchorByAnchorIdResp.success).toBeTruthy()
    expect(getAnchorByAnchorIdResp.payload.length).toBe(3)
    const anchor1 = getAnchorByAnchorIdResp.payload.find(
      (anchor) => anchor.anchorId === 'anchor1'
    )
    expect(isSameAnchor(anchor1, validAnchor1)).toBeTruthy()
    const anchor2 = getAnchorByAnchorIdResp.payload.find(
      (anchor) => anchor.anchorId === 'anchor2'
    )
    expect(isSameAnchor(anchor2, validAnchor2)).toBeTruthy()
    const anchor3 = getAnchorByAnchorIdResp.payload.find(
      (anchor) => anchor.anchorId === 'anchor3'
    )
    expect(isSameAnchor(anchor3, validAnchor3)).toBeTruthy()
  })

  test('success with empty payload array when given invalid nodeId', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const validAnchor = makeIAnchor('anchor2', 'node1', textExtent)
    const createResponse = await backendAnchorGateway.createAnchor(validAnchor)
    expect(createResponse.success).toBeTruthy()
    const getAnchorByIdResp = await backendAnchorGateway.getAnchorsByNodeId(
      'invalidNodeId'
    )
    expect(getAnchorByIdResp.success).toBeTruthy()
    expect(getAnchorByIdResp.payload.length).toBe(0)
  })
})
