import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI

const mongoClient = new MongoClient(MONGO_URI);

await mongoClient.connect();

const db = mongoClient.db("wallet_db");

export default db;