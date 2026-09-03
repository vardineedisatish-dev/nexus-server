import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 5000;
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nexus';
export const JWT_SECRET = process.env.JWT_SECRET || 'nexus_dev_secret_change_in_prod';
export const JWT_EXPIRES_IN = '7d';
