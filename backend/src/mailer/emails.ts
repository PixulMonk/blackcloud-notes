import {
  FORGOT_PASSWORD_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFY_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
} from "./emailTemplates";

import { emailClient } from "./emailClient";

const logoUrl = `${process.env.CLIENT_URL}/logo/logo-horiz.png`;

export const sendEmailTemplate = async (
  to: string,
  subject: string,
  html: string,
  replyTo?: string,
) => {
  try {
    await emailClient.send({
      to,
      subject,
      html,
      ...(replyTo && { replyTo }),
    });
    console.log(`Email sent successfully: To: ${to} Subject: ${subject}`);
  } catch (error) {
    console.error("sendEmailTemplate failed:", error);
    throw error;
  }
};

// Spefic email functions

export const sendVerificationEmail = async (
  name: string,
  email: string,
  verificationToken: string,
) => {
  const template = VERIFY_EMAIL_TEMPLATE.replace("{name}", name)
    .replace("{verificationToken}", verificationToken)
    .replace("{logoUrl}", logoUrl);
  await sendEmailTemplate(email, "Verify Your Email", template);
};

export const sendWelcomeEmail = async (name: string, email: string) => {
  const template = WELCOME_EMAIL_TEMPLATE.replace("{name}", name).replace(
    "{logoUrl}",
    logoUrl,
  );
  await sendEmailTemplate(email, "Welcome to BlackCloud", template);
};

export const sendPasswordResetEmail = async (
  name: string,
  email: string,
  resetLink: string,
) => {
  const template = FORGOT_PASSWORD_TEMPLATE.replace("{name}", name)
    .replace("{resetLink}", resetLink)
    .replace("{logoUrl}", logoUrl);
  await sendEmailTemplate(email, "Password Reset", template);
};

export const sendPasswordResetSuccessEmail = async (
  name: string,
  email: string,
) => {
  const template = PASSWORD_RESET_SUCCESS_TEMPLATE.replace(
    "{name}",
    name,
  ).replace("{logoUrl}", logoUrl);
  await sendEmailTemplate(email, "Your Password Has Been Reset", template);
};

export const sendSupportContactEmail = async (
  fromEmail: string,
  subject: string,
  message: string,
) => {
  const html = `
    <p><strong>From:</strong> ${fromEmail}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <hr />
    <p>${message.replace(/\n/g, "<br />")}</p>
  `;
  await sendEmailTemplate(
    process.env.SUPPORT_INBOX!,
    `[Support] ${subject}`,
    html,
    fromEmail, // replyTo
  );
};
