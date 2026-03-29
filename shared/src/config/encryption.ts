export const ENCRYPTION_CONFIG = {
  schemaVersion: 1,
  argon2: {
    memoryCost: 65536,
    timeCost: 2,
    parallelism: 4,
  },
} as const;
