import { MongoClient } from 'mongodb';

let client;
let db;

export async function connectDB() {
  client = new MongoClient(
    `mongodb://${process.env.MONGO_ROOT_USERNAME}:${process.env.MONGO_ROOT_PASSWORD}@${process.env.MONGO_BASE_URL}`
  );

  await client.connect();
  db = client.db("chatdb");
}

export function getDB() {
  if (!db) {
    throw new Error("DB not initialized.");
  }

  return db;
}

export async function closeDB() {
  if (client) {
    await client.close();
  }
}
