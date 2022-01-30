const express = require("express");
const app = express();
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());
const { MongoClient } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.01vip.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// connection
async function run() {
  try {
    await client.connect();
    const database = client.db("Hawar-Gari");
    const productsCollection = database.collection("products");
    const orderCollection = database.collection("orders");
    const userCollection = database.collection("users");
    const reviewCollection = database.collection("reviews");
    const blogCollection = database.collection("blog");
    // blog collection
    app.get("/blog", async (req, res) => {
      const cursor = blogCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });
    // get all products products
    app.get("/products", async (req, res) => {
      const limit = 6;
      const cursor = productsCollection.find({}).limit(limit);
      const result = await cursor.toArray();
      res.send(result);
    });
    // explore products
    app.get("/allproducts", async (req, res) => {
      const cursor = productsCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.json(result);
    });
    // orders collection
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.json(result);
    });
    //find orders via email.......
    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = orderCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/allOrders", async (req, res) => {
      const cursor = orderCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });
    // add products any admin
    app.post("/products", async (req, res) => {
      const order = req.body;
      console.log(order);
      const result = await productsCollection.insertOne(order);
      res.json(result);
    });
    // for update
    app.put("/allOrders/:id/:uid", async (req, res) => {
      const id = req.params.id;
      const uid = req.params.uid;
      const filter = { _id: ObjectId(id), userId: uid };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: "Shipped",
        },
      };
      const result = await orderCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    app.delete("/allOrders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });
    app.delete("/allproducts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });
    // users collection insert a user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.json(result);
    });
    // find user using email
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });
    // set user as a admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
    // check either user is admin or not 1
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    // reviews section
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.json(result);
    });
    //  get all reviews
    app.get("/reviews", async (req, res) => {
      const cursor = reviewCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("connect to db");
});

app.listen(port, () => {
  console.log("listening from port", port);
});
