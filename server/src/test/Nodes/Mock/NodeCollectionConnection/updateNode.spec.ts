import { INode, makeINode } from '../../../../types'
import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { NodeCollectionConnection } from '../../../../nodes'

describe('Unit Test: updateNode', () => {
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

  test('successfully updates node', async () => {
    const validNode: INode = makeINode('1', ['1'])
    const insertResp = await nodeCollectionConnection.insertNode(validNode)
    expect(insertResp.success).toBeTruthy()
    const updateResp = await nodeCollectionConnection.updateNode('1', {
      content: 'new content',
      title: 'new title',
    })
    expect(updateResp.success).toBeTruthy()
  })

  test('fails to update node if given wrong id', async () => {
    const validNode: INode = makeINode('1', ['1'])
    const insertResp = await nodeCollectionConnection.insertNode(validNode)
    expect(insertResp.success).toBeTruthy()
    const updateResp = await nodeCollectionConnection.updateNode('2', {
      content: 'new content',
      title: 'new title',
    })
    expect(updateResp.success).toBeFalsy()
  })
})
