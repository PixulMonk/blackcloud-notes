import { MailtrapClient } from 'mailtrap';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.MAILTRAP_TOKEN_DEMO;
const SENDER_EMAIL = process.env.MAILTRAP_SENDER;

if (!TOKEN) {
  throw new Error('Mailtrap token is not provided in environment variables');
}

if (!SENDER_EMAIL) {
  throw new Error('Mailtrap sender is not provided in environment variables');
}

export const mailtrapClient = new MailtrapClient({ token: TOKEN });

export const sender = { name: 'BlackCloud Notes', email: SENDER_EMAIL };
