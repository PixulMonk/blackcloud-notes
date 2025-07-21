import crypto from 'crypto';

export const generateSixDigitCode = (): number => {
  return crypto.randomInt(100000, 1000000);
};
