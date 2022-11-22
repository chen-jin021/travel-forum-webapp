import express from 'express'
import dotenv from 'dotenv'
import { Request, Response } from 'express'
import { NodeRouter } from './nodes'
import cors from 'cors'
import { MongoClient } from 'mongodb'
import { AnchorRouter } from './anchors'
import { LinkRouter } from './links'

dotenv.config()
const PORT = process.env.PORT

const app = express()

// start the express web server listening on 5000
app.listen(PORT, () => {
  console.log('Server started on port', PORT)
})

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

const uri = process.env.DB_URI
const mongoClient = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
mongoClient.connect()
// node router
const myNodeRouter = new NodeRouter(mongoClient)
app.use('/node', myNodeRouter.getExpressRouter())
// anchor router
const myAnchorRouter = new AnchorRouter(mongoClient)
app.use('/anchor', myAnchorRouter.getExpressRouter())
// link router
const myLinkRouter = new LinkRouter(mongoClient)
app.use('/link', myLinkRouter.getExpressRouter())

app.get('*', (req: Request, res: Response) => {
  res.send('MyHypermedia Backend Service')
})
