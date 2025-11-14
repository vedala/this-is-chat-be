import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

const mongoClient = new MongoClient(
  `mongodb://${process.env.MONGO_ROOT_USERNAME}:${process.env.MONGO_ROOT_PASSWORD}@${process.env.MONGO_BASE_URL}`
);

await mongoClient.connect();
const dbTemp = mongoClient.db("chatdb");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/messages', async (req, res) => {
  const collection = dbTemp.collection("messages");
  const documents = await collection.find({}).toArray();
console.log(documents);
  res.json(documents);
});

app.post('/messages', async (req, res) => {
  const { message } = req.body;
  console.log(`Received message: ${message}`);

  try {
    const response = await dbTemp.collection("messages").insertOne({
      message
    });

    console.log("insertOne response=", response);
  } catch (e) {
    console.log("Error saving message to dbTemp, e=", e);
  }

  res.status(200).json("success");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
