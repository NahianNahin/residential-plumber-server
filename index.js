const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4k7t9co.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// Verify JWT Function
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: 'unauthorized access' });
  }
  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      console.log(err);
      return res.status(403).send({ message: 'Forbidden access' });
    }
    req.decoded = decoded;
    return next();
  })
}

async function run() {

  try {
    const bannersCollection = client.db("ResidentialPlumber").collection("banners");
    const servicesCollection = client.db("ResidentialPlumber").collection("services");
    const reviewsCollection = client.db("ResidentialPlumber").collection("reviews");
    const blogsCollection = client.db("ResidentialPlumber").collection("blogs");


    // JWT POST API
    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
      res.send({ token });
    })

    // Get All Banners Data
    app.get('/banners', async (req, res) => {
      const cursor = bannersCollection.find({});
      const result = await cursor.toArray();
      res.send(result);

    })
    // Get All Blogs Data
    app.get('/blogs', async (req, res) => {
      const cursor = blogsCollection.find({});
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
    // Service Post
    app.post('/service', async (req, res) => {
      const service = req.body;
      const services = await servicesCollection.insertOne(service);
      res.send(services);
    })
    // Get All Review Data

    app.get('/reviews', verifyJWT, async (req, res) => {
      let mysort = { date: -1 };
      const cursor = reviewsCollection.find({}).sort(mysort);
      const result = await cursor.toArray();
      res.send(result);

    })
    // Get Review by Id
    app.get('/review/:id', verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const selectedReview = await reviewsCollection.findOne(query);
      res.send(selectedReview);

    })
    // Get Reviews data by User Email 
    app.get('/review', verifyJWT, async (req, res) => {
      let query = {};
      const selectedEmail = req.query.email;
      if (selectedEmail) {
        query = {
          email: selectedEmail,
        }
      }
      const result = await reviewsCollection.find(query).sort({ date: -1 }).toArray();
      res.send(result);
    })

    // Get Reviews data by User Email 

    app.get('/service_review', verifyJWT, async (req, res) => {
      let query = {};
      const selectedService = req.query.service;
      if (selectedService) {
        query = {
          service: selectedService,
        }
        const result = await reviewsCollection.find(query).sort({ date: -1 }).toArray();
        res.send(result);
      }
    })

    // Review Post
    app.post('/reviews', verifyJWT, async (req, res) => {
      const review = req.body;
      const reviews = await reviewsCollection.insertOne(review);
      res.send(reviews);
    })

    // Delete Review

    app.delete('/review/:id', verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const result = await reviewsCollection.deleteOne(query);
      res.send(result);
    })

    // Update Review
    app.put('/reviews/:id', verifyJWT, async (req, res) => {
      const id = req.params.id;
      const updatedReviewDetail = req.body;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateReview = {
        $set: {
          date: updatedReviewDetail.date,
          review: updatedReviewDetail.review,
          rating: updatedReviewDetail.rating,
        },
      };
      const result = await reviewsCollection.updateOne(query, updateReview, options);
      res.send(result);

    });



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