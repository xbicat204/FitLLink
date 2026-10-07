import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from './environment'

// Khoi tao 1 doi tuong trelloDatabaseInstance ban dau laf null vi chua connect
let trelloDatabaseInstance = null

//Khoi tao 1 doi tuong mongoClientInstance de connect toi MongoDB
const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

// Ket noi toi DATABASE
export const CONNECT_DB = async () => {
  // Gọi kết nối tôi Mongodb Atlas với URI đã khai báo trong thân của mongoClientInstance
  await mongoClientInstance.connect()

  // Kết nối thành công thì lấy ra Daatabase theo tên và gán ngược nó lại vào biến trellloDatabaseInstance ở tren của chung ta
  trelloDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME)
}

//Dong ket noi DB khi can
export const CLOSE_DB = async () => {
  await mongoClientInstance.close()
}

export const GET_DB = () => {
  if (!trelloDatabaseInstance) throw new Error('Must connect to Database first!')
  return trelloDatabaseInstance
}

