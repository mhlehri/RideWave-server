const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware

app.use(express.json());
app.use(cors());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yynznjj.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const servicesCollection = client.db("ServicesDB").collection("services");
const bookingsCollection = client.db("ServicesDB").collection("bookings");

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // Getting All Services
    try {
      app.get("/services", async (req, res) => {
        const services = servicesCollection.find();
        const results = await services.toArray();
        res.send(results);
      });
    } catch (error) {
      console.log(error.message);
    }

    // getting popular services
    try {
      app.get("/fourServices", async (req, res) => {
        const services = servicesCollection.find().skip(4).limit(4);
        const results = await services.toArray();
        res.send(results);
      });
    } catch (error) {
      console.log(error.message);
    }

    // getting my services
    try {
      app.get("/myServices/:email", async (req, res) => {
        const email = req.params.email;
        const services = servicesCollection.find({ providerEmail: email });
        const results = await services.toArray();
        res.send(results);
      });
    } catch (error) {
      console.log(error.message);
    }

    // getting single service
    try {
      app.get("/details/:id", async (req, res) => {
        const id = req.params.id;
        const result = await servicesCollection.findOne({
          _id: new ObjectId(id),
        });
        res.send(result);
      });
    } catch (error) {
      console.log(error.message);
    }
    // getting booked services
    try {
      app.get("/myBookings/:email", async (req, res) => {
        const email = req.params.email;
        const booking = bookingsCollection.find({
          userEmail: email,
        });
        const result = await booking.toArray();
        res.send(result);
      });
    } catch (error) {
      console.log(error.message);
    }

    // Add Services
    try {
      app.post("/addServices", async (req, res) => {
        const services = req.body;
        const result = await servicesCollection.insertOne(services);
        res.send(result);
      });
    } catch (error) {
      console.log(error.message);
    }
    // Add Bookings
    try {
      app.post("/addBookings", async (req, res) => {
        const booking = req.body;
        const result = await bookingsCollection.insertOne(booking);
        res.send(result);
      });
    } catch (error) {
      console.log(error.message);
    }

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run();

app.get("/", async (req, res) => {
  console.log("Hello server!");
  res.send("Hello server!");
});

app.listen(port, (err) => {
  console.log("ler");
});
