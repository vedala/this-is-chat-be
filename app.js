import 'dotenv/config';
import express from 'express';
import http from "http";
import cors from 'cors';
import { getDB } from './db.js';
import { WebSocketServer, WebSocket } from 'ws';
import checkJwt from './authenticate.js';
import jwt from "jsonwebtoken";
import jwks from "jwks-rsa";

const MESSAGES_COLLECTION = process.env.MESSAGES_COLLECTION;

const app = express();
app.use(express.json());
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const jwksClient = jwks({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
});

function getKey(header, callback) {
  jwksClient.getSigningKey(header.kid, function(err, key) {
    if (err) {
      callback(err);
    } else {
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    }
  });
}

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        audience: process.env.AUTH0_AUDIENCE,
        issuer: `https://${process.env.AUTH0_DOMAIN}/`,
        algorithms: ["RS256"],
      },
      (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      }
    );
  });
}


console.log("about to setup wss");
wss.on("connection", async(ws, req) => {
  console.log("Client connected");
console.log("Clients:", wss.clients.size);

  const [_, queryString] = req.url.split("?");
  const params = new URLSearchParams(queryString);
  const token = params.get("token");

  if (!token) {
    ws.close(4001, "Unauthorized");
    return;
  }

  try {
    const user = await verifyToken(token);
    ws.user = user;
    console.log("ws authenticated user:", user.sub);
    const expiresAt = user.exp * 1000;
    const timeout = setTimeout(() => {
      ws.close(4002, "Token expired");
    }, expiresAt - Date.now());

    ws.on("close", () => {
      clearTimeout(timeout);
    });
  } catch (err) {
    console.log("Invalid token:", err.message);
    ws.close();
  }

  ws.on("message", async (raw) => {
    const msg = JSON.parse(raw);
    console.log("Message event, msg=", msg);

    const messageObject = {
      message: msg.text,
      userId: msg.userId,
      createdAt: new Date(),
    };

    const saved = await getDB().collection(MESSAGES_COLLECTION).insertOne(
      messageObject
    );

    const messageForBroadcast = { ...messageObject };
    messageForBroadcast["_id"]  = saved.insertedId;

    const payload = JSON.stringify({
      message: messageForBroadcast
    });

    wss.clients.forEach((client) => {
      console.log("client,readyState=", client.readyState);
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  });
});



app.get('/messages', checkJwt, async (req, res) => {
  const collection = getDB().collection(MESSAGES_COLLECTION);
  const documents = await collection
    .find({})
    .sort({ createdAt: 1 })
    .toArray();

  res.json(documents);
});

export default server;
