import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getDB } from './db.js';

const MESSAGES_COLLECTION = process.env.MESSAGES_COLLECTION;

const app = express();

app.use(express.json());
app.use(cors());

app.get('/messages', async (req, res) => {
  const collection = getDB().collection(MESSAGES_COLLECTION);
  const documents = await collection.find({}).toArray();

  res.json(documents);
});

app.post('/messages', async (req, res) => {
  const { message } = req.body;
  console.log(`Received message: ${message}`);

  let response;
  try {
    response = await getDB().collection(MESSAGES_COLLECTION).insertOne({
      message
    });

    console.log("insertOne response=", response);
  } catch (e) {
    console.log("Error saving message to db, e=", e);
  }

  res.status(200).json(response.insertedId);
});

export default app;
