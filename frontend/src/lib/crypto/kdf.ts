import { argon2id } from 'hash-wasm';

import { type DerivationResult } from '@/types/encryption';

export const keyDerivationFunction = async (
  masterPassword: string,
  providedSalt?: Uint8Array, // On login, a salt will be provided from the DB
): Promise<DerivationResult> => {
  const argon2Salt =
    providedSalt ?? window.crypto.getRandomValues(new Uint8Array(16));

  const derived = await argon2id({
    password: masterPassword,
    salt: argon2Salt,
    parallelism: 4,
    iterations: 2, // 'time' in your old code
    memorySize: 65536, // 'mem' in your old code
    hashLength: 64,
    outputType: 'binary', // Returns Uint8Array
  });

  if (derived.length !== 64) {
    throw new Error('Invalid key length from Argon2');
  }

  const keyEncryptionKey = derived.slice(0, 32);
  const authToken = derived.slice(32, 64);

  return {
    argon2Salt,
    keyEncryptionKey,
    authToken,
    argon2Params: {
      memoryCost: 65536,
      timeCost: 2,
      parallelism: 4,
      hashLength: 64,
      type: 'argon2id',
    },
  };
};

export default keyDerivationFunction;
