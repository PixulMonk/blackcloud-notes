import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config();

import express, { Express, Request, Response } from 'express';

import { connectDB } from './db/connectDB';
import authRoutes from './routes/auth.route';
import notesRoutes from './routes/notes.route';
import treeNodeRoutes from './routes/treeNode.route';
import treeRoutes from './routes/tree.route';

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL, // prod Vercel URL
  process.env.CLIENT_URL_DEV, // preview Vercel URL or pattern
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);

app.use(cookieParser());
// Added to support base64-encoded images embedded in note content
// Note: MongoDB document size limit is 16mb — monitor note sizes if users
// report save failures on image-heavy notes.
app.use(express.json({ limit: '10mb' }));
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/treeNodes', treeNodeRoutes);
app.use('/api/tree', treeRoutes);
app.use('/public', express.static('public'));

app.listen(PORT, () => {
  connectDB();
  console.log(`Server listening on port ${PORT}`);
});
