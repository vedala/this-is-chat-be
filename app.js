import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { getDB } from './db.js';

const app = express();

app.use(express.json());
app.use(cors());

app.get('/messages', async (req, res) => {
  const collection = await getDB().collection("messages");
  const documents = await collection.find({}).toArray();
console.log(documents);
  res.json(documents);
});

app.post('/messages', async (req, res) => {
  const { message } = req.body;
  console.log(`Received message: ${message}`);

  let response;
  try {
    response = await getDB().collection("messages").insertOne({
      message
    });

    console.log("insertOne response=", response);
  } catch (e) {
    console.log("Error saving message to db, e=", e);
  }

  res.status(200).json(response.insertedId);
});

export default app;
