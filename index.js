const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4k7t9co.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

  try {
    const bannersCollection = client.db("ResidentialPlumber").collection("banners");
    const servicesCollection = client.db("ResidentialPlumber").collection("services");
    const reviewsCollection = client.db("ResidentialPlumber").collection("reviews");

    // Get All Banners Data
    app.get('/banners', async (req, res) => {
      const cursor = bannersCollection.find({});
      const result = await cursor.toArray();
      res.send(result);

    })


    // Get All Services Data

    app.get('/services', async (req, res) => {
      const cursor = servicesCollection.find({});
      const result = await cursor.toArray();
      res.send(result);

    })

    // Get selected Services Data by id
    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const selectedService = await servicesCollection.findOne(query);
      res.send(selectedService);
  })

  // Order Post
  app.post('/reviews', async (req, res) => {
    const review = req.body;
    const reviews = await reviewsCollection.insertOne(review);
    res.send(reviews);
})





  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Assignment 11 server is running')
})

app.listen(port, () => {
  console.log(`Assignment 11 server is listening on port ${port}`)
})