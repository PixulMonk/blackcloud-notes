import { argon2id } from 'hash-wasm';

import { ENCRYPTION_CONFIG } from '@blackcloud/shared';
import type { Argon2Params } from '@blackcloud/shared';

type DerivedKeys = {
  keyEncryptionKey: Uint8Array;
  authToken: Uint8Array;
};

// Default config for new users:
const DEFAULT_ARGON2_PARAMS = ENCRYPTION_CONFIG.argon2;

// Core Argon2ID logic:
const deriveKeys = async (
  masterPassword: string,
  salt: Uint8Array,
  params: Argon2Params,
): Promise<DerivedKeys> => {
  const derived = await argon2id({
    password: masterPassword,
    salt,
    parallelism: params.parallelism,
    iterations: params.timeCost,
    memorySize: params.memoryCost,
    hashLength: params.hashLength,
    outputType: 'binary',
  });

  if (params.type !== 'argon2id') {
    throw new Error('Unsupported KDF type');
  }

  if (derived.length !== params.hashLength) {
    throw new Error('Invalid key length from Argon2');
  }

  return {
    keyEncryptionKey: derived.slice(0, 32),
    authToken: derived.slice(32, params.hashLength),
  };
};

/**
 * Signup / Vault Initialization
 * - Generates new salt
 * - Uses default config
 * - Returns everything needed for backend
 */
export const deriveKeysForNewUser = async (
  masterPassword: string,
): Promise<
  DerivedKeys & {
    argon2Salt: Uint8Array;
    argon2Params: Argon2Params;
  }
> => {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));

  const keys = await deriveKeys(masterPassword, salt, DEFAULT_ARGON2_PARAMS);

  return {
    ...keys,
    argon2Salt: salt,
    argon2Params: ENCRYPTION_CONFIG.argon2,
  };
};

/**
 * 🔑 Login / Vault Unlock
 * - Uses stored salt + params
 * - MUST match exactly what was used before
 */
export const deriveKeysForLogin = async (
  masterPassword: string,
  argon2Salt: Uint8Array,
  argon2Params: Argon2Params,
): Promise<DerivedKeys> => {
  if (argon2Params.type !== 'argon2id') {
    throw new Error('Unsupported KDF type');
  }

  return deriveKeys(masterPassword, argon2Salt, argon2Params);
};
