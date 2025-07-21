import {
  FORGOT_PASSWORD_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFY_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
} from './emailTemplates';

import { mailtrapClient, sender } from './mailtrap.config';

export const sendVerificationEmail = async (
  name: string,
  email: string,
  verificationToken: string
) => {
  const recipient = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: 'Verify Your Email',
      html: VERIFY_EMAIL_TEMPLATE.replace('{name}', name).replace(
        '{verificationToken}',
        verificationToken
      ),
    });
    console.log('Email sent successfully!');
  } catch (error) {
    throw new Error(`Error sending verification email: ${error}`);
  }
};

export const sendWelcomeEmail = async (name: string, email: string) => {
  const recipient = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: 'Welcome to BlackCloud',
      html: WELCOME_EMAIL_TEMPLATE.replace('{name}', name),
    });
  } catch (error) {
    throw new Error(`Error sending welcome email: ${error}`);
  }
};

export const sendPasswordResetEmail = async (
  name: string,
  email: string,
  resetLink: string
) => {
  const recipient = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: 'Password Reset',
      html: FORGOT_PASSWORD_TEMPLATE.replace('{name}', name).replace(
        '{resetLink}',
        resetLink
      ),
    });
  } catch (error) {
    throw new Error(`Error sending welcome email: ${error}`);
  }
};

export const sendPasswordResetSuccessEmail = async (
  name: string,
  email: string
) => {
  const recipient = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: 'Your Password Has Been Reset',
      html: PASSWORD_RESET_SUCCESS_TEMPLATE.replace('{name}', name),
    });
  } catch (error) {
    throw new Error(`Error sending password reset success email: ${error}`);
  }
};
