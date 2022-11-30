import { IUser, makeIUser } from '../../../../types'
import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { UserCollectionConnection } from '../../../../users'
describe('Unit Test: InsertUser', () => {
  let uri
  let mongoClient
  let userCollectionConnection
  let mongoMemoryServer

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create()
    uri = mongoMemoryServer.getUri()
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    userCollectionConnection = new UserCollectionConnection(mongoClient)
    mongoClient.connect()
  })

  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('inserts user', async () => {
    const validuser: IUser = makeIUser(
      '1',
      'test1.com',
      'testUser1',
      'testPW1',
      'testAvatar1'
    )
    const response = await userCollectionConnection.insertUser(validuser)
    expect(response.success).toBeTruthy()
  })

  test('fails to insert invalid document with wrong shape', async () => {
    const invaliduser: any = { id: 'id' }
    const response = await userCollectionConnection.insertUser(invaliduser)
    expect(response.success).toBeFalsy()
  })
})
