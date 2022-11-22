import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { BackendAnchorGateway } from '../../../../anchors'
import {
  isSameAnchor,
  ITextExtent,
  makeIAnchor,
  makeITextExtent,
} from '../../../../types'

describe('Unit Test: getAnchorsById', () => {
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

  test('gets anchors when given valid id', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const validAnchor1 = makeIAnchor('anchor1', 'node1', textExtent)
    const createResponse1 = await backendAnchorGateway.createAnchor(validAnchor1)
    expect(createResponse1.success).toBeTruthy()
    const validAnchor2 = makeIAnchor('anchor2', 'node1', textExtent)
    const createResponse2 = await backendAnchorGateway.createAnchor(validAnchor2)
    expect(createResponse2.success).toBeTruthy()
    const getAnchorsResp = await backendAnchorGateway.getAnchorsById([
      validAnchor1.anchorId,
      validAnchor2.anchorId,
    ])
    expect(getAnchorsResp.success).toBeTruthy()
    expect(getAnchorsResp.payload.length).toBe(2)
    const anchor1 = getAnchorsResp.payload.find((anchor) => anchor.anchorId === 'anchor1')
    expect(isSameAnchor(anchor1, validAnchor1)).toBeTruthy()
    const anchor2 = getAnchorsResp.payload.find((anchor) => anchor.anchorId === 'anchor2')
    expect(isSameAnchor(anchor2, validAnchor2)).toBeTruthy()
  })

  test('gets anchors when given some valid id', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const validAnchor1 = makeIAnchor('anchor1', 'node1', textExtent)
    const createResponse1 = await backendAnchorGateway.createAnchor(validAnchor1)
    expect(createResponse1.success).toBeTruthy()
    const validAnchor2 = makeIAnchor('anchor2', 'node1', textExtent)
    const createResponse2 = await backendAnchorGateway.createAnchor(validAnchor2)
    expect(createResponse2.success).toBeTruthy()
    const getAnchorsResp = await backendAnchorGateway.getAnchorsById([
      validAnchor1.anchorId,
      'invalidId',
    ])
    expect(getAnchorsResp.success).toBeTruthy()
    expect(getAnchorsResp.payload.length).toBe(1)
    const anchor1 = getAnchorsResp.payload.find((anchor) => anchor.anchorId === 'anchor1')
    expect(isSameAnchor(anchor1, validAnchor1)).toBeTruthy()
  })

  test('fails to get anchor when given invalid id', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const validAnchor1 = makeIAnchor('anchor1', 'node1', textExtent)
    const createResponse1 = await backendAnchorGateway.createAnchor(validAnchor1)
    expect(createResponse1.success).toBeTruthy()
    const getAnchorsResp = await backendAnchorGateway.getAnchorsById(['invalidId'])
    expect(getAnchorsResp.success).toBeTruthy()
    expect(getAnchorsResp.payload.length).toBe(0)
  })
})
