import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { BackendUserGateway } from '../../../../Users'
import { IUser, makeIUser } from '../../../../types'

describe('Unit Test: Create User', () => {
  let uri: string
  let mongoClient: MongoClient
  let backendUserGateway: BackendUserGateway
  let mongoMemoryServer: MongoMemoryServer

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create()
    uri = mongoMemoryServer.getUri()
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    backendUserGateway = new BackendUserGateway(mongoClient)
    mongoClient.connect()
  })

  beforeEach(async () => {
    const response = await backendUserGateway.deleteAll()
    expect(response.success).toBeTruthy()
  })

  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('inserts valid User', async () => {
    const validUser: IUser = makeIUser(
      '1',
      'test1.com',
      'testUser1',
      'testPW1',
      'testAvatar1'
    )
    const response = await backendUserGateway.createUser(validUser)
    expect(response.success).toBeTruthy()
    expect(response.payload).toStrictEqual(validUser)
  })

  test('fails to insert User with duplicate id', async () => {
    const validUser1: IUser = makeIUser(
      '1',
      'test1.com',
      'testUser1',
      'testPW1',
      'testAvatar1'
    )
    const validResponse = await backendUserGateway.createUser(validUser1)

    expect(validResponse.success).toBeTruthy()
    const invalidUser2: IUser = makeIUser(
      '1',
      'test1.com',
      'testUser1',
      'testPW1',
      'testAvatar1'
    )
    const invalidResponse = await backendUserGateway.createUser(invalidUser2)
    expect(invalidResponse.success).toBeFalsy()
  })

  test('fails to insert User when id is of invalid id', async () => {
    const invalidUser = makeIUser(
      undefined,
      'test1.com',
      'testUser1',
      'testPW1',
      'testAvatar1'
    )
    const response = await backendUserGateway.createUser(invalidUser)
    expect(response.success).toBeFalsy()
  })

  test('fails to insert User when pw is of invalid pw', async () => {
    const invalidUser = makeIUser('1', 'test1.com', 'testUser1', undefined, 'testAvatar1')
    const response = await backendUserGateway.createUser(invalidUser)
    expect(response.success).toBeFalsy()
  })
})
