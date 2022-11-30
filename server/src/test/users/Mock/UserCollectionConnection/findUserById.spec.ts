import { IUser, makeIUser } from '../../../../types'
import { UserCollectionConnection } from '../../../../users'

import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'

describe('Unit Test: finduserById', () => {
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

  beforeEach(async () => {
    const response = await userCollectionConnection.clearUserCollection()
    expect(response.success).toBeTruthy()
  })

  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('gets user when given valid id', async () => {
    const validuser: IUser = makeIUser(
      '1',
      'test1.com',
      'testUser1',
      'testPW1',
      'testAvatar1'
    )
    const createResponse = await userCollectionConnection.insertUser(validuser)
    expect(createResponse.success).toBeTruthy()
    const finduserByIdResp = await userCollectionConnection.findUserById(validuser.userId)
    expect(finduserByIdResp.success).toBeTruthy()
  })

  test('fails to get user when given invalid id', async () => {
    const validuser: IUser = makeIUser(
      '1',
      'test1.com',
      'testUser1',
      'testPW1',
      'testAvatar1'
    )
    const createResponse = await userCollectionConnection.insertUser(validuser)
    expect(createResponse.success).toBeTruthy()
    const finduserByIdResp = await userCollectionConnection.findUserById('2')
    expect(finduserByIdResp.success).toBeFalsy()
  })
})
