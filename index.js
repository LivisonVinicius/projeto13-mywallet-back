import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import joi from "joi";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";

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

const moneySchema = joi.object({
  value: joi.number().required(),
  description: joi.string().required(),
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
    const encryptedPwd = bcrypt.hashSync(req.body.pwd, 10);
    await db.collection("users").insertOne({
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

app.post("/login", async (req, res) => {
  const email = req.body.email;
  const pwd = req.body.pwd;
  const token = uuid();

  try {
    const tryLogin = await db.collection("users").findOne({ email: email });
    if (!tryLogin) {
      res.sendStatus(404);
    }
    if (!bcrypt.compareSync(pwd, tryLogin.pwd)) {
      res.sendStatus(400);
      return;
    }
    const vrfLogin = await db
      .collection("onlineUsers")
      .findOne({ userID: tryLogin._id });
    if (vrfLogin) {
      await db
        .collection("onlineUsers")
        .updateOne({ userID: tryLogin._id }, { $set: { accessToken: token } });
      console.log("foi editado");
    }
    if (!vrfLogin) {
      await db
        .collection("onlineUsers")
        .insertOne({ userID: tryLogin._id, accessToken: token });
      console.log("foi criado");
    }
    const respToken = await db
      .collection("onlineUsers")
      .findOne({ userID: tryLogin._id });
    const respUser = tryLogin.user;
    const respObj = { userName: respUser, accessToken: respToken.accessToken };
    res.send(respObj).status(200);
    return;
  } catch (error) {
    res.sendStatus(500);
    return;
  }
});

app.post("/deposit", async (req, res) => {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");

  console.log(token);

  if (!token) {
    res.sendStatus(402);
    return;
  }

  const session = await db
    .collection("onlineUsers")
    .findOne({ accessToken: token });

  if (!session) {
    return res.sendStatus(401);
  }

  const validation = moneySchema.validate(req.body, {
    abortEarly: true,
  });

  if (validation.error) {
    res.sendStatus(422);
    return;
  }

  try {
    await db.collection("transactions").insertOne({
      userID: session.userID,
      value: req.body.value,
      description: req.body.description,
      type: "deposit",
      date: dayjs().format("DD/MM"),
    });
    res.sendStatus(200);
    return;
  } catch {
    res.sendStatus(500);
    return;
  }
});

app.post("/withdraw", async (req, res) => {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");

  if (!token) {
    res.sendStatus(401);
    return;
  }

  const session = await db
    .collection("onlineUsers")
    .findOne({ accessToken: token });

  if (!session) {
    return res.sendStatus(401);
  }

  const validation = moneySchema.validate(req.body, {
    abortEarly: true,
  });

  if (validation.error) {
    res.sendStatus(422);
    return;
  }

  try {
    await db.collection("transactions").insertOne({
      userID: session.userID,
      value: req.body.value,
      description: req.body.description,
      type: "withdraw",
      date: dayjs().format("DD/MM"),
    });
    res.sendStatus(200);
    return;
  } catch {
    res.sendStatus(500);
    return;
  }
});

app.get("/records", async (req, res) => {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");

  if (!token) {
    res.sendStatus(402);
    return;
  }

  const session = await db
    .collection("onlineUsers")
    .findOne({ accessToken: token });

  if (!session) {
    return res.sendStatus(401);
  }

  try {
    const transactionList = await db
      .collection("transactions")
      .find({ userID: session.userID })
      .toArray();
    transactionList.forEach((element) => {
      delete element._id;
    });
    res.send(transactionList);
    return;
  } catch (error) {
    res.sendStatus(500);
    return;
  }
});

app.listen(5000);
