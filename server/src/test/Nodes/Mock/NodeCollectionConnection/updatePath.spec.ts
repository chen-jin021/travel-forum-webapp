import { INode, makeINode } from '../../../../types'
import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { NodeCollectionConnection } from '../../../../nodes'

describe('Unit Test: updatePath', () => {
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
    const validNode: INode = makeINode('1', ['1'])
    const insertResp = await nodeCollectionConnection.insertNode(validNode)
    expect(insertResp.success).toBeTruthy()
  })

  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('successfully updates path', async () => {
    const updateResp = await nodeCollectionConnection.updatePath('1', ['2', '1'])
    expect(updateResp.success).toBeTruthy()
  })

  test('fails to update path given impossible path', async () => {
    const updateResp = await nodeCollectionConnection.updatePath('1', ['2'])
    expect(updateResp.success).toBeFalsy()
  })

  test('fails to update path given impossible path', async () => {
    const updateResp = await nodeCollectionConnection.updatePath('1', [])
    expect(updateResp.success).toBeFalsy()
  })

  test('fails to update path when node does not exist', async () => {
    const updateResp = await nodeCollectionConnection.updatePath('2', ['2'])
    expect(updateResp.success).toBeFalsy()
  })
})
