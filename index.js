import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import joi from "joi";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcrypt"
import { v4 as uuid } from 'uuid';

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

app.post("/login", async (req, res) => {
    const email = req.body.email;
    const pwd = req.body.pwd;
    const token = uuid();
    
    try {
      const tryLogin = await db.collection("users").findOne({email: email });
      const vrfLogin = await db.collection("onlineUsers").findOne({id:tryLogin._id})
      console.log(token)
      if (!tryLogin) {
        res.sendStatus(404);
      }
      if (!bcrypt.compareSync(pwd,tryLogin.pwd ) ) {
        res.sendStatus(400);
        return;
      }
      if (vrfLogin){
        await db.collection("onlineUsers").updateOne({userID:tryLogin._id},{$set:{acessToken:token}})
      } 
      if (!vrfLogin){
        await db.collection("onlineUsers").insertOne({ userID:tryLogin._id, acessToken:token})
      }
      const respToken = await db.collection("onlineUsers").findOne({userID:tryLogin._id})
      console.log(respToken)
      const respUser = tryLogin.user
      const respObj = {userName:respUser , acessToken: respToken.acessToken}
      res.send(respObj).status(200);
      return
    }catch (error) {
      res.sendStatus(500);
      return;
    }
  });

app.listen(5000);
