import { Argon2Params } from '../types/encryption.types';

export const ENCRYPTION_CONFIG = {
  schemaVersion: 1,
  argon2: {
    memoryCost: 65536,
    timeCost: 2,
    parallelism: 4,
    hashLength: 64,
    type: 'argon2id',
  } satisfies Argon2Params,
} as const;
