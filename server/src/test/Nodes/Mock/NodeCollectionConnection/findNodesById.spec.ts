import { NodeCollectionConnection } from '../../../../nodes'
import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { INode, makeINode } from '../../../../types'

describe('Unit Test: findNodesById', () => {
  let uri
  let mongoClient
  let nodeCollectionConnection
  let mongoMemoryServer

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create()
    uri = mongoMemoryServer.getUri()
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    nodeCollectionConnection = new NodeCollectionConnection(mongoClient)
    mongoClient.connect()
  })

  beforeEach(async () => {
    const response = await nodeCollectionConnection.clearNodeCollection()
    expect(response.success).toBeTruthy()
  })

  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('gets nodes when given valid ids', async () => {
    const validNode1: INode = makeINode('1', ['1'])
    const validNode2: INode = makeINode('2', ['2'])
    const createResponse1 = await nodeCollectionConnection.insertNode(validNode1)
    const createResponse2 = await nodeCollectionConnection.insertNode(validNode2)
    expect(createResponse1.success).toBeTruthy()
    expect(createResponse2.success).toBeTruthy()
    const findNodesByIdResp = await nodeCollectionConnection.findNodesById([
      validNode1.nodeId,
      validNode2.nodeId,
    ])
    expect(findNodesByIdResp.success).toBeTruthy()
    expect(findNodesByIdResp.payload.length).toBe(2)
  })

  test('success when some nodes are not found', async () => {
    const validNode: INode = makeINode('1', ['1'])
    const createResponse = await nodeCollectionConnection.insertNode(validNode)
    expect(createResponse.success).toBeTruthy()
    const findNodesByIdResp = await nodeCollectionConnection.findNodesById(['1', '2'])
    expect(findNodesByIdResp.success).toBeTruthy()
    expect(findNodesByIdResp.payload.length).toBe(1)
  })

  test('success when nodes are not found', async () => {
    const validNode: INode = makeINode('1', ['1'])
    const createResponse = await nodeCollectionConnection.insertNode(validNode)
    expect(createResponse.success).toBeTruthy()
    const findNodesByIdResp = await nodeCollectionConnection.findNodesById(['2'])
    expect(findNodesByIdResp.success).toBeTruthy()
    expect(findNodesByIdResp.payload.length).toBe(0)
  })
})
