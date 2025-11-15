import { MongoClient } from 'mongodb';

let client;
let db;

export async function connectDB(uri, dbName) {
  client = new MongoClient(uri);

  await client.connect();
  db = client.db(dbName);
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
