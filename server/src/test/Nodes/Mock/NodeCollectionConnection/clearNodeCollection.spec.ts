import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { NodeCollectionConnection } from '../../../../nodes'
import { INode, makeINode } from '../../../../types'

describe('Unit Test: ClearNodeCollection', () => {
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

  test('successfully deletes all root nodes', async () => {
    const validNode1: INode = makeINode('1', ['1'])
    const response1 = await nodeCollectionConnection.insertNode(validNode1)
    expect(response1.success).toBeTruthy()

    const validNode2: INode = makeINode('2', ['2'])
    const response2 = await nodeCollectionConnection.insertNode(validNode2)
    expect(response2.success).toBeTruthy()

    const validNode3: INode = makeINode('3', ['2', '3'])
    const response3 = await nodeCollectionConnection.insertNode(validNode3)
    expect(response3.success).toBeTruthy()

    const deleteAllResp = await nodeCollectionConnection.clearNodeCollection()
    expect(deleteAllResp.success).toBeTruthy()

    const findNode1Resp = await nodeCollectionConnection.findNodeById('1')
    expect(findNode1Resp.success).toBeFalsy()
    const findNode2Resp = await nodeCollectionConnection.findNodeById('2')
    expect(findNode2Resp.success).toBeFalsy()
    const findNode3Resp = await nodeCollectionConnection.findNodeById('3')
    expect(findNode3Resp.success).toBeFalsy()
  })

  test('successfully deletes all nested nodes', async () => {
    const validNode1: INode = makeINode('1', ['1'])
    const response1 = await nodeCollectionConnection.insertNode(validNode1)
    expect(response1.success).toBeTruthy()

    const validNode2: INode = makeINode('2', ['1', '2'])
    const response2 = await nodeCollectionConnection.insertNode(validNode2)
    expect(response2.success).toBeTruthy()

    const validNode3: INode = makeINode('3', ['1', '2', '3'])
    const response3 = await nodeCollectionConnection.insertNode(validNode3)
    expect(response3.success).toBeTruthy()

    const deleteAllResp = await nodeCollectionConnection.clearNodeCollection()
    expect(deleteAllResp.success).toBeTruthy()

    const findNode1Resp = await nodeCollectionConnection.findNodeById('1')
    expect(findNode1Resp.success).toBeFalsy()
    const findNode2Resp = await nodeCollectionConnection.findNodeById('2')
    expect(findNode2Resp.success).toBeFalsy()
    const findNode3Resp = await nodeCollectionConnection.findNodeById('3')
    expect(findNode3Resp.success).toBeFalsy()
  })

  test('successfully deletes nested and root nodes', async () => {
    const validNode1: INode = makeINode('1', ['1'])
    const response1 = await nodeCollectionConnection.insertNode(validNode1)
    expect(response1.success).toBeTruthy()

    const validNode2: INode = makeINode('2', ['2'])
    const response2 = await nodeCollectionConnection.insertNode(validNode2)
    expect(response2.success).toBeTruthy()

    const validNode3: INode = makeINode('3', ['2', '3'])
    const response3 = await nodeCollectionConnection.insertNode(validNode3)
    expect(response3.success).toBeTruthy()

    const deleteAllResp = await nodeCollectionConnection.clearNodeCollection()
    expect(deleteAllResp.success).toBeTruthy()

    const findNode1Resp = await nodeCollectionConnection.findNodeById('1')
    expect(findNode1Resp.success).toBeFalsy()
    const findNode2Resp = await nodeCollectionConnection.findNodeById('2')
    expect(findNode2Resp.success).toBeFalsy()
    const findNode3Resp = await nodeCollectionConnection.findNodeById('3')
    expect(findNode3Resp.success).toBeFalsy()
  })
})
