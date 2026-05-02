import nodemailer from 'nodemailer';

// We add this setting to tell nodemailer the host isn't secure during dev
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Create a test account or replace with real credentials.
export const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 1025, //send via 1025 and open localhost:1080 for MailDev
  secure: false, // true for 465, false for other ports
});
