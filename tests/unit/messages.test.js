import request from "supertest";
import app from "../../app.js";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connectDB, getDB } from "../../db.js";

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await connectDB(uri);
  const response = await getDB().collection("messages").insertOne({
    message: "a message"
  });
});

afterAll(async () => {
  if (mongo) await mongo.stop();
});

describe("Express Chat App", () =>  {

    test("GET /messages returns all messages", async () => {
      const res = await request(app).get("/messages");
console.log("res.body=", res.body);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body.find(item => item.message === 'a message')).toBeDefined();
    });
});
