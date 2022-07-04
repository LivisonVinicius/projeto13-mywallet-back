import dayjs from "dayjs";
import db from "../db.js";

export async function deposit(req, res) {
  const user = await db
    .collection("users")
    .findOne({ _id: res.locals.session.userID });
  const sum = Number(user.balance) + Number(req.body.money);
  await db
    .collection("users")
    .updateOne({ _id: res.locals.session.userID }, { $set: { balance: sum } });
  const updatedUser = await db
    .collection("users")
    .findOne({ _id: res.locals.session.userID });
  await db.collection("transactions").insertOne({
    userID: res.locals.session.userID,
    money: req.body.money,
    description: req.body.description,
    type: "deposit",
    newBalance: updatedUser.balance,
    date: dayjs().format("DD/MM"),
  });
  res.sendStatus(200);
  return;
}

export async function withdraw(req, res) {
  const user = await db
    .collection("users")
    .findOne({ _id: res.locals.session.userID });
  const sum = Number(user.balance) - Number(req.body.money);
  await db
    .collection("users")
    .updateOne({ _id: res.locals.session.userID }, { $set: { balance: sum } });
  const updatedUser = await db
    .collection("users")
    .findOne({ _id: res.locals.session.userID });
  await db.collection("transactions").insertOne({
    userID: res.locals.session.userID,
    money: req.body.money,
    description: req.body.description,
    type: "withdraw",
    newBalance: updatedUser.balance,
    date: dayjs().format("DD/MM"),
  });
  res.sendStatus(200);
  return;
}

export async function records(req, res) {
  const transactionList = await db
    .collection("transactions")
    .find({ userID: res.locals.session.userID })
    .toArray();
  res.send(transactionList).status(200);
  return;
}
