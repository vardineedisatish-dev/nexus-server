import mongoose from 'mongoose';
import { MONGO_URI } from './index.js';

let connected = false;

export async function connectDB() {
  if (connected) return;

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(MONGO_URI);
    connected = true;
    console.log(`[db] connected to ${MONGO_URI}`);
  } catch (err) {
    console.error('[db] connection failed:', err.message);
    throw err;
  }
}
