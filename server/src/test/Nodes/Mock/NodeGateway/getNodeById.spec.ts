import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { BackendNodeGateway } from '../../../../nodes'
import { INode, makeINodePath } from '../../../../types'

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

  test('gets node when given valid id', async () => {
    const validNode: INode = {
      title: 'validNode',
      nodeId: '1',
      type: 'text',
      content: 'example text content',
      filePath: makeINodePath(['1']),
    }
    const createResponse = await backendNodeGateway.createNode(validNode)
    expect(createResponse.success).toBeTruthy()
    const getNodeByIdResp = await backendNodeGateway.getNodeById(validNode.nodeId)
    expect(getNodeByIdResp.success).toBeTruthy()
  })

  test('fails to get node when given invalid id', async () => {
    const validNode: INode = {
      title: 'validNode',
      nodeId: '1',
      type: 'text',
      content: 'example text content',
      filePath: makeINodePath(['1']),
    }
    const createResponse = await backendNodeGateway.createNode(validNode)
    expect(createResponse.success).toBeTruthy()
    const getNodeByIdResp = await backendNodeGateway.getNodeById('2')
    expect(getNodeByIdResp.success).toBeFalsy()
  })
})
