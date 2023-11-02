const express = require('express')
const cors = require('cors')
var jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zku3u3r.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  } 
});


// * Our middlewares
const logger = async (req, res, next) => {
  console.log('loggerCalled: ', req.host, req.originalUrl)
  next()
}

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
  if(!token){
    return res.status(401).send({message: 'not authorized'})
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if(err){
      return res.status(401).send({message: 'unauthorized'})
    }
    req.user = decoded;
    next()
  })
}


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const serviceCollection = client.db('carDoctorDB').collection('services')
    const orderCollection = client.db('carDoctorDB').collection('orders')

    // auth related api
    app.post('/jwt', logger,  async (req, res) => {
        const user = req.body;
        console.log(user)
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})

        res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', 
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        .send({success: true})
    })
    

    //* service related api
    // get all services
    app.get('/services', async (req, res) => {
        const cursor = serviceCollection.find()
        const result = await cursor.toArray()
        res.send(result)
    })

    // get specific service
    app.get('/services/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const options = {
            projection: { title: 1, price: 1, service_id: 1, img: 1 },
        }
        const result = await serviceCollection.findOne(query, options)
        res.send(result)
    })

    // insert order to database
    app.post('/orders', async (req, res) => {
        const order = req.body;
        const result = await orderCollection.insertOne(order)
        res.send(result)
    })

    // get specific orders by user email
    app.get('/orders', logger, verifyToken, async (req, res) => {
      console.log('user in the valid token', req.user)
      if(req.query.email !== req.user.email){
        return res.status(403).send('forbidden access')
      }
      
      let query = {}
      if(req.query?.email){
        query = {email: req.query.email}
      }
      const result = await orderCollection.find(query).toArray()
      res.send(result)
    })

    // update/approve pending orders of cart
    app.patch('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const updatedDoc = req.body;
      console.log(updatedDoc)
      const doc = {
        $set: {
          status: updatedDoc.status,
        }
      }
      const result = await orderCollection.updateOne(query, doc)
      res.send(result)
    })

    // delete specific orders
    app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await orderCollection.deleteOne(query)
      res.send(result)
    })
    
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Car Doctor is running')
})

app.listen(port, () => {
    console.log('Car Doctor server is running on port', port)
})