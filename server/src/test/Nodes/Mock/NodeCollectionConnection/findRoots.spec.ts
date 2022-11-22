import { INode, isSameNode, makeINode } from '../../../../types'
import { NodeCollectionConnection } from '../../../../nodes'

import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'

describe('Unit Test: findRoots', () => {
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

  test('finds valid roots', async () => {
    const validNode1: INode = makeINode('1', ['1'])
    const validNode2: INode = makeINode('2', ['2'], ['3', '4'])
    const validNode3: INode = makeINode('3', ['2', '3'], ['5'])
    const validNode4: INode = makeINode('4', ['2', '4'])
    const validNode5: INode = makeINode('5', ['2', '3', '5'])
    const createResponse1 = await nodeCollectionConnection.insertNode(validNode1)
    expect(createResponse1.success).toBeTruthy()
    const createResponse2 = await nodeCollectionConnection.insertNode(validNode2)
    expect(createResponse2.success).toBeTruthy()
    const createResponse3 = await nodeCollectionConnection.insertNode(validNode3)
    expect(createResponse3.success).toBeTruthy()
    const createResponse4 = await nodeCollectionConnection.insertNode(validNode4)
    expect(createResponse4.success).toBeTruthy()
    const createResponse5 = await nodeCollectionConnection.insertNode(validNode5)
    expect(createResponse5.success).toBeTruthy()
    const findRootsResp = await nodeCollectionConnection.findRoots()
    expect(findRootsResp.success).toBeTruthy()
    expect(findRootsResp.payload.length).toBe(2)
    const node1 = findRootsResp.payload.find((node) => node.nodeId === '1')
    expect(isSameNode(node1, validNode1)).toBeTruthy()
    const node2 = findRootsResp.payload.find((node) => node.nodeId === '2')
    expect(isSameNode(node2, validNode2)).toBeTruthy()
  })

  test('still success response when no roots found', async () => {
    const findRootsResp = await nodeCollectionConnection.findRoots()
    expect(findRootsResp.success).toBeTruthy()
  })
})
