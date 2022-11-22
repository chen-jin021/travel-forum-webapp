import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { BackendNodeGateway } from '../../../../nodes'
import { INode, makeINode } from '../../../../types'

describe('Unit Test: Delete All', () => {
  let uri
  let mongoClient
  let backendNodeGateway
  let mongoMemoryServer

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create()
    uri = mongoMemoryServer.getUri()
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    backendNodeGateway = new BackendNodeGateway(mongoClient)
    mongoClient.connect()
  })

  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('successfully deletes all root nodes', async () => {
    const validNode1: INode = makeINode('1', ['1'])
    const response1 = await backendNodeGateway.createNode(validNode1)
    expect(response1.success).toBeTruthy()

    const validNode2: INode = makeINode('2', ['2'])
    const response2 = await backendNodeGateway.createNode(validNode2)
    expect(response2.success).toBeTruthy()

    const validNode3: INode = makeINode('3', ['2', '3'])
    const response3 = await backendNodeGateway.createNode(validNode3)
    expect(response3.success).toBeTruthy()

    const deleteAllResp = await backendNodeGateway.deleteAll()
    expect(deleteAllResp.success).toBeTruthy()

    const findNode1Resp = await backendNodeGateway.getNodeById('1')
    expect(findNode1Resp.success).toBeFalsy()
    const findNode2Resp = await backendNodeGateway.getNodeById('2')
    expect(findNode2Resp.success).toBeFalsy()
    const findNode3Resp = await backendNodeGateway.getNodeById('3')
    expect(findNode3Resp.success).toBeFalsy()
  })

  test('successfully deletes all nested nodes', async () => {
    const validNode1: INode = makeINode('1', ['1'])
    const response1 = await backendNodeGateway.createNode(validNode1)
    expect(response1.success).toBeTruthy()

    const validNode2: INode = makeINode('2', ['1', '2'])
    const response2 = await backendNodeGateway.createNode(validNode2)
    expect(response2.success).toBeTruthy()

    const validNode3: INode = makeINode('3', ['1', '2', '3'])
    const response3 = await backendNodeGateway.createNode(validNode3)
    expect(response3.success).toBeTruthy()

    const deleteAllResp = await backendNodeGateway.deleteAll()
    expect(deleteAllResp.success).toBeTruthy()

    const findNode1Resp = await backendNodeGateway.getNodeById('1')
    expect(findNode1Resp.success).toBeFalsy()
    const findNode2Resp = await backendNodeGateway.getNodeById('2')
    expect(findNode2Resp.success).toBeFalsy()
    const findNode3Resp = await backendNodeGateway.getNodeById('3')
    expect(findNode3Resp.success).toBeFalsy()
  })

  test('successfully deletes nested and root nodes', async () => {
    const validNode1: INode = makeINode('1', ['1'])
    const response1 = await backendNodeGateway.createNode(validNode1)
    expect(response1.success).toBeTruthy()

    const validNode2: INode = makeINode('2', ['2'])
    const response2 = await backendNodeGateway.createNode(validNode2)
    expect(response2.success).toBeTruthy()

    const validNode3: INode = makeINode('3', ['2', '3'])
    const response3 = await backendNodeGateway.createNode(validNode3)
    expect(response3.success).toBeTruthy()

    const deleteAllResp = await backendNodeGateway.deleteAll()
    expect(deleteAllResp.success).toBeTruthy()

    const findNode1Resp = await backendNodeGateway.getNodeById('1')
    expect(findNode1Resp.success).toBeFalsy()
    const findNode2Resp = await backendNodeGateway.getNodeById('2')
    expect(findNode2Resp.success).toBeFalsy()
    const findNode3Resp = await backendNodeGateway.getNodeById('3')
    expect(findNode3Resp.success).toBeFalsy()
  })
})
