import { INode, makeINode } from '../../../../types'
import { NodeCollectionConnection } from '../../../../nodes'

import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'

describe('Unit Test: findNodeById', () => {
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

  test('gets node when given valid id', async () => {
    const validNode: INode = makeINode('1', ['1'])
    const createResponse = await nodeCollectionConnection.insertNode(validNode)
    expect(createResponse.success).toBeTruthy()
    const findNodeByIdResp = await nodeCollectionConnection.findNodeById(validNode.nodeId)
    expect(findNodeByIdResp.success).toBeTruthy()
  })

  test('fails to get node when given invalid id', async () => {
    const validNode: INode = makeINode('1', ['1'])
    const createResponse = await nodeCollectionConnection.insertNode(validNode)
    expect(createResponse.success).toBeTruthy()
    const findNodeByIdResp = await nodeCollectionConnection.findNodeById('2')
    expect(findNodeByIdResp.success).toBeFalsy()
  })
})
