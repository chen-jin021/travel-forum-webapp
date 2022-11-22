import { INode, makeINode } from '../../../../types'
import { NodeCollectionConnection } from '../../../../nodes'

import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'

describe('Unit Test: deleteNodes', () => {
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

  test('successfully deletes single node', async () => {
    const validNode: INode = makeINode('1', ['1'])
    const createResponse = await nodeCollectionConnection.insertNode(validNode)
    expect(createResponse.success).toBeTruthy()
    const deleteNodeResp = await nodeCollectionConnection.deleteNodes(['1'])
    expect(deleteNodeResp.success).toBeTruthy()
  })

  test('successfully deletes multiple nodes', async () => {
    const validNode1: INode = makeINode('1', ['1'])
    const createResponse1 = await nodeCollectionConnection.insertNode(validNode1)
    expect(createResponse1.success).toBeTruthy()
    const validNode2: INode = makeINode('2', ['1', '2'])
    const createResponse2 = await nodeCollectionConnection.insertNode(validNode2)
    expect(createResponse2.success).toBeTruthy()
    const deleteNodeResp = await nodeCollectionConnection.deleteNodes(['1', '2'])
    expect(deleteNodeResp.success).toBeTruthy()
    const findNodeResp1 = await nodeCollectionConnection.findNodeById('1')
    expect(findNodeResp1.success).toBeFalsy()
    const findNodeResp2 = await nodeCollectionConnection.findNodeById('2')
    expect(findNodeResp2.success).toBeFalsy()
  })

  test('gives success if we try to delete nodes that ' + 'don\'t exist', async () => {
    const validNode: INode = makeINode('1', ['1'])
    const createResponse = await nodeCollectionConnection.insertNode(validNode)
    expect(createResponse.success).toBeTruthy()
    const deleteNodeResp = await nodeCollectionConnection.deleteNodes(['1', '2'])
    expect(deleteNodeResp.success).toBeTruthy()
    const findNodeResp = await nodeCollectionConnection.findNodeById('1')
    expect(findNodeResp.success).toBeFalsy()
  })
})
