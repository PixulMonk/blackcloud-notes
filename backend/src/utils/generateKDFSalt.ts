import crypto from 'crypto';

export const generateSalt = (): string =>
  crypto.randomBytes(16).toString('base64');
