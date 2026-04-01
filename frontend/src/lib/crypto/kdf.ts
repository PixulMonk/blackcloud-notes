import * as argon2 from 'argon2-browser';

import { type DerivationResult } from '@/types/encryption';

export const keyDerivationFunction = async (
  masterPassword: string,
  providedSalt?: Uint8Array, // On login, a salt will be provided from the DB
): Promise<DerivationResult> => {
  const argon2Salt =
    providedSalt ?? window.crypto.getRandomValues(new Uint8Array(16));

  const derived = await argon2.hash({
    pass: masterPassword,
    salt: argon2Salt,
    time: 2,
    mem: 65536,
    hashLen: 64,
    parallelism: 4,
    type: argon2.ArgonType.Argon2id,
  });

  if (derived.hash.length !== 64) {
    throw new Error('Invalid key length from Argon2');
  }

  const keyEncryptionKey = derived.hash.slice(0, 32);
  const authToken = derived.hash.slice(32, 64);

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
