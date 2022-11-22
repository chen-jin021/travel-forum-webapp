import { INode, makeINode } from '../../../../types'
import { NodeCollectionConnection } from '../../../../nodes'

import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'

describe('Unit Test: deleteNode', () => {
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

  test('successfully deletes node', async () => {
    const validNode: INode = makeINode('1', ['1'])
    const createResponse = await nodeCollectionConnection.insertNode(validNode)
    expect(createResponse.success).toBeTruthy()
    const deleteNodeResp = await nodeCollectionConnection.deleteNode('1')
    expect(deleteNodeResp.success).toBeTruthy()
  })

  test('gives success if we try to delete node that ' + 'does not exist', async () => {
    const validNode: INode = makeINode('1', ['1'])
    const createResponse = await nodeCollectionConnection.insertNode(validNode)
    expect(createResponse.success).toBeTruthy()
    const deleteNodeResp = await nodeCollectionConnection.deleteNode('2')
    expect(deleteNodeResp.success).toBeTruthy()
  })
})
