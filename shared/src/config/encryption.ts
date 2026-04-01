export const ENCRYPTION_CONFIG = {
  schemaVersion: 1,
  argon2: {
    type: 'argon2id',
    memoryCost: 65536,
    timeCost: 2,
    parallelism: 4,
    hashLength: 64,
  },
} as const;
