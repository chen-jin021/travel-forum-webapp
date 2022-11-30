import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { BackendNodeGateway } from '../../../../nodes'
import { ILocNode, INode, makeINodePath } from '../../../../types'

describe('Unit Test: Get Node By Id', () => {
  let uri
  let mongoClient
  let backendNodeGateway
  let mongoMemoryServer

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create()
    uri = mongoMemoryServer.getUri()
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    backendNodeGateway = new BackendNodeGateway(mongoClient)
    mongoClient.connect()
  })

  beforeEach(async () => {
    const response = await backendNodeGateway.deleteAll()
    expect(response.success).toBeTruthy()
  })

  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('gets node when given user id', async () => {
    const validNode: ILocNode = {
      title: 'validNode',
      nodeId: '1',
      type: 'text',
      content: 'example text content',
      filePath: makeINodePath(['1']),
      lat: 0,
      lng: 0,
      userReadIds : ["read1", "read5", "read3", "read4", "h", "f"],
      userWriteIds:["write2", "write5", "write6", "write7", "b", "g"],
      ownerId: "a"
    }
    const createResponse = await backendNodeGateway.createNode(validNode)
    expect(createResponse.success).toBeTruthy()
    const getNodeByIdResp = await backendNodeGateway.fetchNodesByUserId('read4')
    expect(getNodeByIdResp.success).toBeTruthy()
  })

  test('success to get node when given user id that not exists', async () => {
    const validNode: ILocNode = {
      title: 'validNode',
      nodeId: '1',
      type: 'text',
      content: 'example text content',
      filePath: makeINodePath(['1']),
      lat: 0,
      lng: 0,
      userReadIds : ["read1", "read5", "read3", "read4", "h", "f"],
      userWriteIds:["write2", "write5", "write6", "write7", "b", "g"],
      ownerId: "a"
    }
    const createResponse = await backendNodeGateway.createNode(validNode)
    expect(createResponse.success).toBeTruthy()
    const getNodeByIdResp = await backendNodeGateway.fetchNodesByUserId('h')
    expect(getNodeByIdResp.success).toBeTruthy()
  })
})
