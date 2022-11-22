import { INode, makeINode } from '../../../../types'
import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { NodeCollectionConnection } from '../../../../nodes'

describe('Unit Test: InsertNode', () => {
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

  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('inserts node', async () => {
    const validNode: INode = makeINode('1', ['1'])
    const response = await nodeCollectionConnection.insertNode(validNode)
    expect(response.success).toBeTruthy()
  })

  test('fails to insert invalid document with wrong shape', async () => {
    const invalidNode: any = { id: 'id' }
    const response = await nodeCollectionConnection.insertNode(invalidNode)
    expect(response.success).toBeFalsy()
  })

  test('fails to insert invalid document with correct shape', async () => {
    const doc: INode = makeINode('2', ['1'])
    const response = await nodeCollectionConnection.insertNode(doc)
    expect(response.success).toBeFalsy()
  })
})
