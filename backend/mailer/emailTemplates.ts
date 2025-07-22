import fs from 'fs';
import path from 'path';

function loadTemplate(templateName: string): string {
  return fs.readFileSync(
    path.join(__dirname, 'templates', templateName),
    'utf-8'
  );
}

export const VERIFY_EMAIL_TEMPLATE = loadTemplate('verifyEmailTemplate.html');
export const WELCOME_EMAIL_TEMPLATE = loadTemplate('welcomeEmailTemplate.html');
export const FORGOT_PASSWORD_TEMPLATE = loadTemplate(
  'passwordResetRequestTemplate.html'
);
export const PASSWORD_RESET_SUCCESS_TEMPLATE = loadTemplate(
  'passwordResetSuccessTemplate.html'
);
