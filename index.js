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
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
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

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send({ message: "Unauthorize. access denied!" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

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
      app.get("/myServices/:email", verifyToken, async (req, res) => {
        const email = req.params.email;
        console.log("owner", req.user, email, req.cookies);
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

    // getting pending services
    try {
      app.get("/myPending/:email", async (req, res) => {
        const email = req.params.email;
        const query = {
          providerEmail: email,
        };
        const booking = bookingsCollection.find(query);
        const result = await booking.toArray();
        res.send(result);
      });
    } catch (error) {
      console.log(error.message);
    }

    //jwt
    try {
      app.post("/jwt", async (req, res) => {
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
          expiresIn: "1h",
        });
        res
          .cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
          })
          .send({ success: true });
      });
    } catch (error) {
      console.log(error.message);
    }

    //jwt token remove
    try {
      app.post("/logout", async (req, res) => {
        const user = req.body;
        console.log("logged out");
        res.clearCookie("token", { maxAge: 0 }).send({ success: true });
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
    // update Bookings
    try {
      app.patch("/updateServices", async (req, res) => {
        const providerEmail = req.body.user;
        const query = { providerEmail };
        console.log(providerEmail);
        const update = {
          $set: {
            serviceImage: req.body?.serviceImage,
            serviceName: req.body?.serviceName,
            servicePrice: req.body?.servicePrice,
            serviceArea: req.body?.serviceArea,
            serviceDescription: req.body?.serviceDescription,
          },
        };
        const result = await servicesCollection.updateOne(query, update);
        res.send(result);
      });
    } catch (error) {
      console.log(error.message);
    }

    // remove Services
    try {
      app.delete("/services/:id", async (req, res) => {
        const id = req.params.id;
        const result = await servicesCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res.send(result);
      });
    } catch (error) {
      console.log(error.message);
    }
    // remove Bookings
    try {
      app.delete("/bookings/:id", async (req, res) => {
        const id = req.params.id;
        const result = await bookingsCollection.deleteOne({
          _id: new ObjectId(id),
        });
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
