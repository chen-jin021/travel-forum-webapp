import { INode, makeINode, makeINodeProperty, isSameNode } from '../../../../types'
import { BackendNodeGateway } from '../../../../nodes'
import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'

describe('Unit Test: Update Node', () => {
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
  })

  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('successfully updates node\'s field', async () => {
    const updateResp = await backendNodeGateway.updateNode('1', [
      makeINodeProperty('content', 'new content'),
      makeINodeProperty('title', 'new title'),
    ])
    expect(updateResp.success).toBeTruthy()
    expect(updateResp.payload.content === 'new content').toBeTruthy()
    const findNodeByIdResp = await backendNodeGateway.getNodeById('1')
    expect(findNodeByIdResp.payload.content === 'new content').toBeTruthy()
    expect(findNodeByIdResp.payload.title === 'new title').toBeTruthy()
  })

  test('fails to update node when field name is incorrect', async () => {
    const updateResp = await backendNodeGateway.updateNode('1', [
      { fieldName: 'asdf', value: 'new content' },
    ])
    expect(updateResp.success).toBeFalsy()
    const findNodeByIdResp = await backendNodeGateway.getNodeById('1')
    expect(isSameNode(findNodeByIdResp.payload, makeINode('1', ['1']))).toBeTruthy()
  })

  test('fails to update node when field value ' + 'is incorrect type', async () => {
    const updateResp = await backendNodeGateway.updateNode('1', [
      { fieldName: 'content', value: 1 },
    ])
    expect(updateResp.success).toBeFalsy()
    const findNodeByIdResp = await backendNodeGateway.getNodeById('1')
    expect(isSameNode(findNodeByIdResp.payload, makeINode('1', ['1']))).toBeTruthy()
  })

  test('fails to update node with impossible filePath', async () => {
    const updateResp = await backendNodeGateway.updateNode('1', [
      { fieldName: 'filePath', value: ['1', '2'] },
    ])
    expect(updateResp.success).toBeFalsy()
    const findNodeByIdResp = await backendNodeGateway.getNodeById('1')
    expect(isSameNode(findNodeByIdResp.payload, makeINode('1', ['1']))).toBeTruthy()
  })
})
