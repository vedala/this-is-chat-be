import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
})

app.post('/messages', async (req, res) => {
  const { message } = req.body;
  console.log(`Received message: ${message}.`);
  res.send("success");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
