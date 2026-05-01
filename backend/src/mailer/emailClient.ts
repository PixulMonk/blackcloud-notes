import { Resend } from 'resend';
import dotenv from 'dotenv';
import { transporter } from './nodemailer.config';

dotenv.config();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const isResend = process.env.EMAIL_PROVIDER === 'resend';

const sender = {
  name: 'BlackCloud',
  address: process.env.RESEND_SENDER!,
};

const resend = new Resend(RESEND_API_KEY);

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
};

export const emailClient = {
  send: async ({ to, subject, html }: EmailOptions) => {
    if (isResend) {
      if (!RESEND_API_KEY) {
        throw new Error('Resend API key not provided.');
      }

      if (!sender) {
        throw new Error('Resend sender not provided.');
      }

      if (!to || !to.includes('@')) {
        throw new Error('Invalid recipient email');
      }

      return await resend.emails.send({
        from: `${sender.name} <${sender.address}>`,
        to: [to],
        subject,
        html,
      });
    }

    return transporter.sendMail({
      from: sender,
      to,
      subject,
      html,
    });
  },
};
