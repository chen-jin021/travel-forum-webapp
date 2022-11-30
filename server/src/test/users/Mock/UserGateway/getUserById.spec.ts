import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { BackendUserGateway } from '../../../../Users'
import { IUser } from '../../../../types'

describe('Unit Test: Get User By Id', () => {
  let uri
  let mongoClient
  let backendUserGateway
  let mongoMemoryServer

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

  test('gets User when given valid id', async () => {
    const validUser: IUser = {
      userId: '1',
      mail: 'test1.com',
      userName: 'testUser1',
      encodedPW: 'testPW1',
      avatar: 'testAvatar1',
    }
    const createResponse = await backendUserGateway.createUser(validUser)
    expect(createResponse.success).toBeTruthy()
    const getUserByIdResp = await backendUserGateway.getUserById(validUser.userId)
    expect(getUserByIdResp.success).toBeTruthy()
  })

  test('fails to get User when given invalid id', async () => {
    const validUser: IUser = {
      userId: '1',
      mail: 'test1.com',
      userName: 'testUser1',
      encodedPW: 'testPW1',
      avatar: 'testAvatar1',
    }
    const createResponse = await backendUserGateway.createUser(validUser)
    expect(createResponse.success).toBeTruthy()
    const getUserByIdResp = await backendUserGateway.getUserById('2')
    expect(getUserByIdResp.success).toBeFalsy()
  })
})
