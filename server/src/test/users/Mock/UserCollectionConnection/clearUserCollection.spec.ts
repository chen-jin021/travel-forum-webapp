import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { UserCollectionConnection } from '../../../../users'
import { IUser, makeIUser } from '../../../../types'

describe('Unit Test: ClearUserCollection', () => {
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

  test('successfully deletes all Users', async () => {
    const validUser1: IUser = makeIUser(
      '1',
      'test1.com',
      'testUser1',
      'testPW1',
      'testAvatar1'
    )
    const response1 = await userCollectionConnection.insertUser(validUser1)
    expect(response1.success).toBeTruthy()

    const validUser2: IUser = makeIUser(
      '2',
      'test2.com',
      'testUser2',
      'testPW2',
      'testAvatar2'
    )
    const response2 = await userCollectionConnection.insertUser(validUser2)
    expect(response2.success).toBeTruthy()

    const validUser3: IUser = makeIUser(
      '3',
      'test3.com',
      'testUser3',
      'testPW3',
      'testAvatar3'
    )
    const response3 = await userCollectionConnection.insertUser(validUser3)
    expect(response3.success).toBeTruthy()

    const deleteAllResp = await userCollectionConnection.clearUserCollection()
    expect(deleteAllResp.success).toBeTruthy()

    const findUser1Resp = await userCollectionConnection.findUserById('1')
    expect(findUser1Resp.success).toBeFalsy()
    const findUser2Resp = await userCollectionConnection.findUserById('2')
    expect(findUser2Resp.success).toBeFalsy()
    const findUser3Resp = await userCollectionConnection.findUserById('3')
    expect(findUser3Resp.success).toBeFalsy()
  })
})
