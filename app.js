import 'dotenv/config';
import express from 'express';
import http from "http";
import cors from 'cors';
import { getDB } from './db.js';
import { WebSocketServer } from 'ws';

const MESSAGES_COLLECTION = process.env.MESSAGES_COLLECTION;

const app = express();
app.use(express.json());
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocketServer({ server });



console.log("about to setup wss");
wss.on("connection", async(ws) => {
  console.log("Client connected");

  ws.on("message", async (raw) => {
    const msg = JSON.parse(raw);
    console.log("Message event, msg=", msg);

    const saved = await getDB().collection(MESSAGES_COLLECTION).insertOne({
      message: msg.text
    });

    const payload = JSON.stringify({
      message: {
        _id: saved.insertedId,
        message: msg.text
      }
    });

    wss.clients.forEach((client) => {
      console.log("client,readyState=", client.readyState);
      if (client.readyState === ws.OPEN) {
        client.send(payload);
      }
    });
  });
});



app.get('/messages', async (req, res) => {
  const collection = getDB().collection(MESSAGES_COLLECTION);
  const documents = await collection.find({}).toArray();

  res.json(documents);
});



export default server;
