import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

import express, { Express, Request, Response } from 'express';

import { connectDB } from '../db/connectDB';
import authRoutes from './routes/auth.route';
import notesRoutes from './routes/notes.route';

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());
app.use(cookieParser());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/public', express.static('public'));

app.listen(PORT, () => {
  connectDB();
  console.log(`Server listening on port ${PORT}`);
});
