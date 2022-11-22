import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { BackendLinkGateway } from '../../../../links'
import { ILink, makeILink } from '../../../../types'

describe('Unit Test: Create Link', () => {
  let uri: string
  let mongoClient: MongoClient
  let backendLinkGateway: BackendLinkGateway
  let mongoMemoryServer: MongoMemoryServer

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create()
    uri = mongoMemoryServer.getUri()
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    backendLinkGateway = new BackendLinkGateway(mongoClient)
    mongoClient.connect()
  })

  beforeEach(async () => {
    const response = await backendLinkGateway.deleteAll()
    expect(response.success).toBeTruthy()
  })

  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('inserts valid link', async () => {
    const validLink: ILink = makeILink('link1', 'anchor1', 'anchor2', 'node1', 'node2')
    const response = await backendLinkGateway.createLink(validLink)
    expect(response.success).toBeTruthy()
    expect(response.payload).toStrictEqual(validLink)
  })

  test('fails to insert link with duplicate id', async () => {
    const validLink: ILink = makeILink('link1', 'anchor1', 'anchor2', 'node1', 'node2')
    const validResponse = await backendLinkGateway.createLink(validLink)
    expect(validResponse.success).toBeTruthy()
    const invalidLink: ILink = makeILink('link1', 'anchor1', 'anchor2', 'node1', 'node2')
    const invalidResponse = await backendLinkGateway.createLink(invalidLink)
    expect(invalidResponse.success).toBeFalsy()
  })

  test('fails to insert link with duplicate anchorIds', async () => {
    const invalidLink: ILink = makeILink('link1', 'anchor1', 'anchor1', 'node1', 'node2')
    const invalidResponse = await backendLinkGateway.createLink(invalidLink)
    expect(invalidResponse.success).toBeFalsy()
  })

  test('fails to insert link when link is of invalid type', async () => {
    const invalidLink = {
      linkId: 1,
      anchor: 'anchor1',
      anchor2Id: 'anchor2',
    }
    const response = await backendLinkGateway.createLink(invalidLink)
    expect(response.success).toBeFalsy()
  })

  test('fails to insert link when anchorId is of invalid type', async () => {
    const invalidLink = {
      linkId: 'link1',
      anchor1Id: 1,
      anchor2Id: 'anchor2',
    }
    const response = await backendLinkGateway.createLink(invalidLink)
    expect(response.success).toBeFalsy()
  })

  test('fails to insert link when linkId is not defined', async () => {
    const invalidLink = makeILink(undefined, 'anchor1', 'anchor2', 'node1', 'node2')
    const response = await backendLinkGateway.createLink(invalidLink)
    expect(response.success).toBeFalsy()
  })

  test('fails to insert link when anchor1Id is not defined', async () => {
    const invalidLink = makeILink('link1', undefined, 'anchor2', 'node1', 'node2')
    const response = await backendLinkGateway.createLink(invalidLink)
    expect(response.success).toBeFalsy()
  })

  test('fails to insert link when anchor2Id is not defined', async () => {
    const invalidLink = makeILink('link1', 'anchor1', undefined, 'node1', 'node2')
    const response = await backendLinkGateway.createLink(invalidLink)
    expect(response.success).toBeFalsy()
  })

  test('fails to insert link when fieldName is missing', async () => {
    const invalidLink = {
      linkId: 'link1',
      anchor1Id: 'anchor1',
    }
    const response = await backendLinkGateway.createLink(invalidLink)
    expect(response.success).toBeFalsy()
  })

  test('fails to insert link with wrong shape', async () => {
    const invalidLink = {
      linkId: '1',
      anchor: 'anchor1',
      anchor2Id: 'anchor2',
    }
    const response = await backendLinkGateway.createLink(invalidLink)
    expect(response.success).toBeFalsy()
  })
})
