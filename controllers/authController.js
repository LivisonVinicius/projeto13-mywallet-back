import bcrypt from "bcrypt";
import db from "../db.js";
import { v4 as uuid } from "uuid";

export async function registerF(req, res) {
  const newUser = req.body;

  const encryptedPwd = bcrypt.hashSync(newUser.pwd, 10);
  await db.collection("users").insertOne({
    user: newUser.user,
    email: newUser.email,
    pwd: encryptedPwd,
    balance: 0,
  });
  res.sendStatus(200);
  return;
}

export async function login(req, res) {
  const email = req.body.email;
  const pwd = req.body.pwd;
  const token = uuid();

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
  }
  if (!vrfLogin) {
    await db
      .collection("onlineUsers")
      .insertOne({ userID: tryLogin._id, accessToken: token });
  }
  const respToken = await db
    .collection("onlineUsers")
    .findOne({ userID: tryLogin._id });
  const respUser = tryLogin.user;
  const respObj = { userName: respUser, accessToken: respToken.accessToken };
  res.send(respObj).status(200);
  return;
}
