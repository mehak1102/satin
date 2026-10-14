import dns from 'dns';
import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDb() {
  if (!env.mongodbUri) {
    console.warn('MONGODB_URI is not set. API routes that need the database will fail until it is configured.');
    return null;
  }

  if (env.mongodbUri.startsWith('mongodb+srv://')) {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongodbUri);
  return mongoose.connection;
}
