import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { MongoClient } from 'mongodb';

const db = await open({
  filename: 'chatapp.db',
  driver: sqlite3.Database,
});

const mongoClient = new MongoClient(
  `mongodb://${process.env.MONGO_ROOT_USERNAME}:${process.env.MONGO_ROOT_PASSWORD}@${process.env.MONGO_BASE_URL}`
);

await mongoClient.connect();
const dbTemp = mongoClient.db("chatdb");

await db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT
  );
`);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/messages', async (req, res) => {
  const rows = await db.all("SELECT * FROM messages");
  const collection = dbTemp.collection("messages");
  const documents = await collection.find({}).toArray();
console.log(documents);
  res.json(documents);
});

app.post('/messages', async (req, res) => {
  const { message } = req.body;
  console.log(`Received message: ${message}`);
  let result;
  try {
    result = await db.run('INSERT INTO messages (message) VALUES (?)', message);
  } catch(e) {
    console.log("Error saving message to db");
    res.status(500).json("Error saving message to db");
  }

  try {
    const result = await dbTemp.collection("messages").insertOne({
      message
    });
  } catch (e) {
    console.log("Error saving message to dbTemp, e=", e);
  }

  res.status(200).json("success");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
