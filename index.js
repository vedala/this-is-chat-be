import app from "./app.js";
import { connectDB } from './db.js';

const PORT = process.env.PORT || 4000;

await connectDB(
  `${process.env.MONGO_SCHEME}://${process.env.MONGO_ROOT_USERNAME}:${process.env.MONGO_ROOT_PASSWORD}@${process.env.MONGO_BASE_URL}`,
  process.env.MONGO_DB_NAME
);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
