import express from 'express';
import router from './routes/index.js';
import cors from 'cors';
import dotenv from "dotenv"

dotenv.config()

const app = express();
app.use(express.json());
app.use(cors());

app.use(router);

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log('Server OK');
});