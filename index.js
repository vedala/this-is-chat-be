import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

const mongoClient = new MongoClient(
  `mongodb://${process.env.MONGO_ROOT_USERNAME}:${process.env.MONGO_ROOT_PASSWORD}@${process.env.MONGO_BASE_URL}`
);

await mongoClient.connect();
const db = mongoClient.db("chatdb");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

app.get('/messages', async (req, res) => {
  const collection = db.collection("messages");
  const documents = await collection.find({}).toArray();
console.log(documents);
  res.json(documents);
});

app.post('/messages', async (req, res) => {
  const { message } = req.body;
  console.log(`Received message: ${message}`);

  let response;
  try {
    response = await db.collection("messages").insertOne({
      message
    });

    console.log("insertOne response=", response);
  } catch (e) {
    console.log("Error saving message to db, e=", e);
  }

  res.status(200).json(response.insertedId);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
