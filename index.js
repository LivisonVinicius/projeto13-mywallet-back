import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import joi from "joi";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcrypt"

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
const mongoClient = new MongoClient(process.env.MONGO_URI);

let db;
mongoClient.connect(() => {
  db = mongoClient.db("wallet_db");
});

const userSchema = joi.object({
  user: joi.string().required(),
  email: joi.string().required(),
  pwd: joi.string().required(),
});

app.post("/register", async (req, res) => {
  const validation = userSchema.validate(req.body, {
    abortEarly: true,
  });
  const existingUser = await db
    .collection("users")
    .findOne({ user: req.body.user });

    const existingEmail = await db
    .collection("users")
    .findOne({ email: req.body.email });

  if (validation.error) {
    res.sendStatus(422);
    return;
  }
  if (existingUser || existingEmail) {
    res.sendStatus(409);
    return;
  }
  try {
    const encryptedPwd = bcrypt.hashSync(req.body.pwd, 10) ;
    await db
      .collection("users")
      .insertOne({
        user: req.body.user,
        email: req.body.email,
        pwd: encryptedPwd,
      });
    res.sendStatus(201);
    return;
  } catch (error) {
    res.sendStatus(500);
    return;
  }
});

app.listen(5000);
