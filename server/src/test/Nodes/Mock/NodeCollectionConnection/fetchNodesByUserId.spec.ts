import { NodeCollectionConnection } from '../../../../nodes'
import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { INode, ILocNode, makeILocNode, makeINode } from '../../../../types'

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

  test('gets nodes when given valid user id', async () => {
    const validNode1: ILocNode = makeILocNode('1', ['1'], [], 'image', 'node1', " ", "a", ["b", "c"], ["d", 'e'], 0, 0)
    const validNode2: ILocNode = makeILocNode('2', ['2'], [], 'image', 'node2', " ", "b", ["f", "g"], ["h", 'i'], 0, 0)
    const createResponse1 = await nodeCollectionConnection.insertNode(validNode1)
    const createResponse2 = await nodeCollectionConnection.insertNode(validNode2)
    expect(createResponse1.success).toBeTruthy()
    expect(createResponse2.success).toBeTruthy()
    const findNodesByUserIdResp = await nodeCollectionConnection.fetchNodesByUserId("b")
    expect(findNodesByUserIdResp.success).toBeTruthy()
    expect(findNodesByUserIdResp.payload.length).toBe(2)
  })

  test('success when some nodes do not contain this user', async () => {
    const validNode1: ILocNode = makeILocNode('1', ['1'], [], 'image', 'node1', " ", "a", ["b", "c"], ["d", 'e'], 0, 0)
    const validNode2: ILocNode = makeILocNode('2', ['2'], [], 'image', 'node2', " ", "b", ["f", "g"], ["h", 'i'], 0, 0)
    const createResponse1 = await nodeCollectionConnection.insertNode(validNode1)
    const createResponse2 = await nodeCollectionConnection.insertNode(validNode2)
    expect(createResponse1.success).toBeTruthy()
    expect(createResponse2.success).toBeTruthy()
    const findNodesByUserIdResp = await nodeCollectionConnection.fetchNodesByUserId("c")
    expect(findNodesByUserIdResp.success).toBeTruthy()
    expect(findNodesByUserIdResp.payload.length).toBe(1)
  })

  test('success when nodes are not found', async () => {
    const validNode: ILocNode = makeILocNode('1', ['1'], [], 'image', 'node1', " ", "a", ["b", "c"], ["d", 'e'], 0, 0)
    const createResponse = await nodeCollectionConnection.insertNode(validNode)
    expect(createResponse.success).toBeTruthy()
    const findNodesByIdResp = await nodeCollectionConnection.fetchNodesByUserId("null")
    expect(findNodesByIdResp.success).toBeTruthy()
    expect(findNodesByIdResp.payload.length).toBe(0)
  })
})
