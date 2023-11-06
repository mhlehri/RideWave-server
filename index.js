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

const uri =
  "mongodb+srv://mahmudhassanlehri:mhlehri101@cluster0.yynznjj.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const servicesCollection = client.db("ServicesDB").collection("services");

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

    try {
      app.get("/fourServices", async (req, res) => {
        const services = servicesCollection.find().limit(4);
        const results = await services.toArray();
        res.send(results);
      });
    } catch (error) {
      console.log(error.message);
    }

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

    // Add Services
    try {
    } catch (error) {}
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
