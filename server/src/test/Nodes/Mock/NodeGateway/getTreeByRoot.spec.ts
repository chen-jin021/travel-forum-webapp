import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { BackendNodeGateway } from '../../../../nodes'
import { INode, makeINode } from '../../../../types'

describe('Unit Test: Get Tree By Root', () => {
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

  beforeEach(async () => {
    const response = await backendNodeGateway.deleteAll()
    expect(response.success).toBeTruthy()
    const validNode1: INode = makeINode('1', ['1'])
    const response1 = await backendNodeGateway.createNode(validNode1)
    expect(response1.success).toBeTruthy()
    const validNode2: INode = makeINode('2', ['2'])
    const response2 = await backendNodeGateway.createNode(validNode2)
    expect(response2.success).toBeTruthy()
    const validNode3: INode = makeINode('3', ['2', '3'])
    const response3 = await backendNodeGateway.createNode(validNode3)
    expect(response3.success).toBeTruthy()
    const validNode4: INode = makeINode('4', ['2', '4'])
    const response4 = await backendNodeGateway.createNode(validNode4)
    expect(response4.success).toBeTruthy()
    const validNode5: INode = makeINode('5', ['2', '3', '5'])
    const response5 = await backendNodeGateway.createNode(validNode5)
    expect(response5.success).toBeTruthy()
  })

  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('gets single node with no children', async () => {
    const getResp = await backendNodeGateway.getTreeByVertex('1')
    expect(getResp.success).toBeTruthy()

    expect(getResp.payload.node.nodeId === '1')
    expect(getResp.payload.children.length).toBe(0)
  })

  test('gets all descendants of valid node', async () => {
    const getResponse = await backendNodeGateway.getTreeByVertex('2')
    const wrapper2 = getResponse.payload
    expect(wrapper2.children.length).toBe(2)
    const wrapper3 = wrapper2.children.find((wrapper) => wrapper.node.nodeId === '3')
    expect(wrapper3.children.length).toBe(1)
    const wrapper4 = wrapper2.children.find((wrapper) => wrapper.node.nodeId === '4')
    expect(wrapper4.children.length).toBe(0)
    const wrapper5 = wrapper3.children.find((wrapper) => wrapper.node.nodeId === '5')
    expect(wrapper5.children.length).toBe(0)
  })

  test('fails to get descendants of invalid node', async () => {
    const getResponse = await backendNodeGateway.getTreeByVertex('')
    expect(getResponse.success).toBeFalsy()
  })
})
