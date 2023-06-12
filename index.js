const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://artCraftUser:pLOaqQOkVZW24t7t@cluster0.kt6fwyn.mongodb.net/?retryWrites=true&w=majority";

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