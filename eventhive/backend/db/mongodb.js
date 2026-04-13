const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI is missing from .env');
}

const client = new MongoClient(uri);

let db;

async function connectDB() {
  if (db) return db;

  await client.connect();
  db = client.db('eventhive');
  console.log('Connected to MongoDB');
  return db;
}

module.exports = connectDB;