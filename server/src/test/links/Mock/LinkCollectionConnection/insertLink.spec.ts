import { ILink, makeILink } from '../../../../types'
import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { LinkCollectionConnection } from '../../../../links'

describe('Unit Test: InsertLink', () => {
  let uri
  let mongoClient
  let linkCollectionConnection
  let mongoMemoryServer

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create()
    uri = mongoMemoryServer.getUri()
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    linkCollectionConnection = new LinkCollectionConnection(mongoClient)
    mongoClient.connect()
  })

  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('inserts link', async () => {
    const validLink: ILink = makeILink('link1', 'anchor1', 'anchor2', 'node1', 'node2')
    const response = await linkCollectionConnection.insertLink(validLink)
    expect(response.success).toBeTruthy()
  })

  test('fails to insert invalid document with wrong shape', async () => {
    const invalidLink: any = { id: 'id' }
    const response = await linkCollectionConnection.insertLink(invalidLink)
    expect(response.success).toBeFalsy()
  })

  test('fails to insert invalid document with correct shape', async () => {
    const doc: ILink = makeILink('link1', 'anchor1', 'anchor1', 'node1', 'node2')
    const response = await linkCollectionConnection.insertLink(doc)
    expect(response.success).toBeFalsy()
  })
})
