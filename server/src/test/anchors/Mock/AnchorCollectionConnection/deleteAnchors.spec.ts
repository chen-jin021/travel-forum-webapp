import { ITextExtent, makeIAnchor, makeITextExtent } from '../../../../types'
import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { AnchorCollectionConnection } from '../../../../anchors'

describe('Unit Test: deleteNodes', () => {
  let uri
  let mongoClient
  let anchorCollectionConnection
  let mongoMemoryServer

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create()
    uri = mongoMemoryServer.getUri()
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    anchorCollectionConnection = new AnchorCollectionConnection(mongoClient)
    mongoClient.connect()
  })

  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('successfully deletes single anchor', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const validAnchor = makeIAnchor('anchorId', 'nodeId', textExtent)
    const createResponse = await anchorCollectionConnection.insertAnchor(validAnchor)
    expect(createResponse.success).toBeTruthy()
    const retrieveResponse = await anchorCollectionConnection.findAnchorById(
      validAnchor.anchorId
    )
    expect(retrieveResponse.success).toBeTruthy()
    const deleteResponse = await anchorCollectionConnection.deleteAnchors([
      validAnchor.anchorId,
    ])
    expect(deleteResponse.success).toBeTruthy()
    const retrieveResponse1 = await anchorCollectionConnection.findAnchorById(
      validAnchor.anchorId
    )
    expect(retrieveResponse1.success).toBeFalsy()
  })

  test('successfully deletes multiple anchors', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const validAnchor = makeIAnchor('anchorId', 'nodeId', textExtent)
    const validAnchor2 = makeIAnchor('anchorId2', 'nodeId2', textExtent)
    const validAnchor3 = makeIAnchor('anchorId3', 'nodeId3', textExtent)
    const createResponse = await anchorCollectionConnection.insertAnchor(validAnchor)
    expect(createResponse.success).toBeTruthy()
    const createResponse2 = await anchorCollectionConnection.insertAnchor(validAnchor2)
    expect(createResponse2.success).toBeTruthy()
    const createResponse3 = await anchorCollectionConnection.insertAnchor(validAnchor3)
    expect(createResponse3.success).toBeTruthy()
    const retrieveResponse = await anchorCollectionConnection.findAnchorById(
      validAnchor.anchorId
    )
    expect(retrieveResponse.success).toBeTruthy()
    const retrieveResponse2 = await anchorCollectionConnection.findAnchorById(
      validAnchor2.anchorId
    )
    expect(retrieveResponse2.success).toBeTruthy()
    const retrieveResponse3 = await anchorCollectionConnection.findAnchorById(
      validAnchor3.anchorId
    )
    expect(retrieveResponse3.success).toBeTruthy()
    const deleteResponse = await anchorCollectionConnection.deleteAnchors([
      validAnchor.anchorId,
      validAnchor2.anchorId,
      validAnchor3.anchorId,
    ])
    expect(deleteResponse.success).toBeTruthy()
    const retrieveResponse4 = await anchorCollectionConnection.findAnchorById(
      validAnchor.anchorId
    )
    expect(retrieveResponse4.success).toBeFalsy()
    const retrieveResponse5 = await anchorCollectionConnection.findAnchorById(
      validAnchor2.anchorId
    )
    expect(retrieveResponse5.success).toBeFalsy()
    const retrieveResponse6 = await anchorCollectionConnection.findAnchorById(
      validAnchor3.anchorId
    )
    expect(retrieveResponse6.success).toBeFalsy()
  })

  test('gives success if we try to delete anchors that don\'t exist', async () => {
    const textExtent: ITextExtent = makeITextExtent('text', 1, 3)
    const validAnchor = makeIAnchor('anchorId', 'nodeId', textExtent)
    const createResponse = await anchorCollectionConnection.insertAnchor(validAnchor)
    expect(createResponse.success).toBeTruthy()
    const deleteResponse = await anchorCollectionConnection.deleteAnchors([
      'anchorId',
      'invalidId',
    ])
    expect(deleteResponse.success).toBeTruthy()
  })
})
