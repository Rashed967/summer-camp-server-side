const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())


const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: 'unauthorized access' });
  }
  // bearer token
  const token = authorization.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: true, message: 'unauthorized access' })
    }
    req.decoded = decoded;
    next();
  })
}


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DbUser}:${process.env.DbPass}@cluster0.kt6fwyn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // database collection 
    const intructorCollection = client.db('instructorDb').collection('instructors')
    const classCollection = client.db('instructorDb').collection('classs')
    const bookedClassesCollection = client.db('instructorDb').collection('bookedClasses')
    const userCollection = client.db('instructorDb').collection('users')

    

    // intructor collection db
    app.get('/instructors', async(req, res) => {
      const result = await intructorCollection.find().toArray()
      res.send(result)
    })


    // classes collection 
    app.get('/classes', async(req, res) => {
      const result = await classCollection.find().toArray()
      res.send(result)
    })
  
    app.post('/classes', async (req, res) => {
      const newclass = req.body
      const result = classCollection.insertOne(newclass)
      res.send(result)
    })

    app.get('/classessByEmail', async(req, res) => {
        const email = req.query.email
      if(!email){
        res.send([])
      }
        const result = await classCollection.find({email}).toArray()
        res.send(result)
    })

  app.put('/classes/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const filter = {_id : new ObjectId(id)}
  const options = { upsert: true };
  
  const updateDoc = {
    $set: {
      status : status
    },
  }; 
  const result = await classCollection.updateOne(filter, updateDoc, options);
  res.send(result)
});


    // booked class 

    app.get('/bookedClasses', async(req, res) => {
      const result = await bookedClassesCollection.find({}).toArray()
      res.send(result)
    })


   app.post('/bookedClasses', async(req, res) => {
    const bookedClass = req.body
    const id = bookedClass._id
    const duplicate = await bookedClassesCollection.findOne({_id : id})
    if(!duplicate){
      const result = await bookedClassesCollection.insertOne(bookedClass)
    res.send(result)
    }
   })

   app.delete('/bookedClasses/:id', async(req, res) => {
    const id = req.params.id;
    const result = await bookedClassesCollection.deleteOne({_id : id})
    res.send(result)
   })

  //  users collection 
  app.post('/users', async (req, res) => {
    const user = req.body;
    const query = { email: user.email }
    const existingUser = await userCollection.findOne(query);

    if (existingUser) {
      return res.send({ message: 'user already exists' })
    }

    const result = await userCollection.insertOne(user);
    res.send(result);
  });

  app.get('/users', async(req, res) => {
    const result = await userCollection.find().toArray()
    res.send(result)
  })

  app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { roll } = req.body;
    const filter = {_id : new ObjectId(id)}
    const options = { upsert: true };
    
    const updateDoc = {
      $set: {
        roll : roll
      },
    }; 
    const result = await userCollection.updateOne(filter, updateDoc, options);
    res.send(result)
  });

  app.post('/jwt', (req, res) => {
    const user = req.body;
    // console.log(user)
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30h' })

    res.send({ token })
  })


  // check admin 

  app.get('/users/admin/:email', verifyJWT, async (req, res) => {
    const email = req.params.email;

    if (req.decoded.email !== email) {
      res.send({ admin: false })
    }

    const query = { email: email }
    const user = await userCollection.findOne(query);
    const result = { admin: user?.roll === 'admin' }
    res.send(result);
  })


  app.get('/getUserRoll', async(req, res) => {
    const email = req.query.email
    console.log(email)
  if(!email){
    res.send([])
  }
    const result = await userCollection.findOne({email})
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
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})