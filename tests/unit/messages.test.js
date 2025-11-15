import request from "supertest";
import app from "../../app.js";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connectDB, getDB, closeDB } from "../../db.js";

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await connectDB(uri);
});

afterAll(async () => {
  await closeDB();
  if (mongo) await mongo.stop();
});

beforeEach(async () => {
  await getDB().collection("messages").deleteMany({});

  const messageData = [
    { message: "message one" },
    { message: "message two" },
    { message: "message three" },
  ];

  await getDB().collection("messages").insertMany(messageData);
});

describe("Express Chat App", () =>  {

  test("GET /messages returns all messages", async () => {
    const res = await request(app).get("/messages");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body.find(item => item.message === "message one")).toBeDefined();
    expect(res.body.find(item => item.message === "message two")).toBeDefined();
    expect(res.body.find(item => item.message === "message three")).toBeDefined();
  });

  test("POST /messages returns inserted message", async () => {
    const res = await request(app)
      .post("/messages")
      .set('Content-Type', 'application/json')
      .send({message: "another message"});

    expect(res.statusCode).toBe(200);

    const allMessages = await getDB().collection("messages").find({}).toArray();
    expect(allMessages).toHaveLength(4);
    expect(allMessages.find(item => item.message === "another message")).toBeDefined();
  });

});
