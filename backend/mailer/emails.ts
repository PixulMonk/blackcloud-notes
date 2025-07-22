import {
  FORGOT_PASSWORD_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFY_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
} from './emailTemplates';

import { sender } from './mailtrap.config';
import { emailClient } from './emailClient';

type EmailSender =
  | { name: string; address: string } // Nodemailer format
  | { name: string; email: string }; // Mailtrap format

const emailSender: EmailSender =
  process.env.NODE_ENV === 'production'
    ? sender
    : { name: 'BlackCloud', address: 'noreply@blackcloud.com' };

export const sendEmailTemplate = async (
  to: string,
  subject: string,
  htmlTemplate: string
) => {
  try {
    await emailClient.send({
      from: emailSender,
      to,
      subject,
      html: htmlTemplate,
    });
    console.log(`Email sent successfully: To: ${to} Subject: ${subject}`);
  } catch (error) {
    throw new Error('Error in sending email');
  }
};

// Spefic email functions

export const sendVerificationEmail = async (
  name: string,
  email: string,
  verificationToken: string
) => {
  const template = VERIFY_EMAIL_TEMPLATE.replace('{name}', name).replace(
    '{verificationToken}',
    verificationToken
  );
  await sendEmailTemplate(email, 'Verify Your Email', template);
};

export const sendWelcomeEmail = async (name: string, email: string) => {
  const template = WELCOME_EMAIL_TEMPLATE.replace('{name}', name);
  await sendEmailTemplate(email, 'Welcome to BlackCloud', template);
};

export const sendPasswordResetEmail = async (
  name: string,
  email: string,
  resetLink: string
) => {
  const template = FORGOT_PASSWORD_TEMPLATE.replace('{name}', name).replace(
    '{resetLink}',
    resetLink
  );
  await sendEmailTemplate(email, 'Password Reset', template);
};

export const sendPasswordResetSuccessEmail = async (
  name: string,
  email: string
) => {
  const template = PASSWORD_RESET_SUCCESS_TEMPLATE.replace('{name}', name);
  await sendEmailTemplate(email, 'Your Password Has Been Reset', template);
};
