import {
  FORGOT_PASSWORD_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFY_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
} from './emailTemplates';

import { emailClient } from './emailClient';

const logoUrl = `${process.env.APP_DOMAIN}/logo/logo-horiz.svg`; // TODO: need to be replaced

export const sendEmailTemplate = async (
  to: string,
  subject: string,
  html: string,
) => {
  try {
    await emailClient.send({
      to: to,
      subject: subject,
      html: html,
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
  verificationToken: string,
) => {
  const template = VERIFY_EMAIL_TEMPLATE.replace('{name}', name)
    .replace('{verificationToken}', verificationToken)
    .replace('logoUrl', logoUrl);
  await sendEmailTemplate(email, 'Verify Your Email', template);
};

export const sendWelcomeEmail = async (name: string, email: string) => {
  const template = WELCOME_EMAIL_TEMPLATE.replace('{name}', name).replace(
    'logoUrl',
    logoUrl,
  );
  await sendEmailTemplate(email, 'Welcome to BlackCloud', template);
};

export const sendPasswordResetEmail = async (
  name: string,
  email: string,
  resetLink: string,
) => {
  const template = FORGOT_PASSWORD_TEMPLATE.replace('{name}', name)
    .replace('{resetLink}', resetLink)
    .replace('logoUrl', logoUrl);
  await sendEmailTemplate(email, 'Password Reset', template);
};

export const sendPasswordResetSuccessEmail = async (
  name: string,
  email: string,
) => {
  const template = PASSWORD_RESET_SUCCESS_TEMPLATE.replace(
    '{name}',
    name,
  ).replace('logoUrl', logoUrl);
  await sendEmailTemplate(email, 'Your Password Has Been Reset', template);
};
