import { MongoClient } from 'mongodb'
import { BackendUserGateway } from '../../../users'
import { IUser, UserType, IServiceResponse } from '../../../types'
import uniqid from 'uniqid'

jest.setTimeout(50000)

describe('E2E Test: user CRUD', () => {
  let mongoClient: MongoClient
  let backendUserGateway: BackendUserGateway
  let uri: string
  let collectionName: string

  function generateuserId(type: UserType) {
    return uniqid(type + '.')
  }

  const testuserId = generateuserId('user')

  const testuser: IUser = {
    userId: testuserId,
    mail: 'test.com',
    userName: 'testUser',
    encodedPW: 'testPW',
    avatar: 'testAvatar',
  }

  beforeAll(async () => {
    uri = process.env.DB_URI
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    collectionName = 'e2e-test-users'
    backendUserGateway = new BackendUserGateway(mongoClient, collectionName)
    await mongoClient.connect()

    const getResponse = await backendUserGateway.getUserById(testuser.userId)
    expect(getResponse.success).toBeFalsy()
  })

  afterAll(async () => {
    await mongoClient.db().collection(collectionName).drop()
    const getResponse = await backendUserGateway.getUserById(testuser.userId)
    expect(getResponse.success).toBeFalsy()
    await mongoClient.close()
  })

  test('creates user', async () => {
    const response = await backendUserGateway.createUser(testuser)
    expect(response.success).toBeTruthy()
  })

  test('retrieves user', async () => {
    const response = await backendUserGateway.getUserById(testuser.userId)
    expect(response.success).toBeTruthy()
    expect(response.payload.userId).toEqual(testuser.userId)
    expect(response.payload.mail).toEqual(testuser.mail)
    expect(response.payload.userName).toEqual(testuser.userName)
    expect(response.payload.encodedPW).toEqual(testuser.encodedPW)
    expect(response.payload.avatar).toEqual(testuser.avatar)
  })
})
