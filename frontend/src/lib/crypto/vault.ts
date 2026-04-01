import { ENCRYPTION_CONFIG } from '@blackcloud/shared';
import { type VaultInitializationResult } from '@/types/encryption';

export const initializeUserVault = async (
  kek: Uint8Array,
): Promise<VaultInitializationResult> => {
  const dekBytes = window.crypto.getRandomValues(new Uint8Array(32)); //256-bits
  const ivBytes = window.crypto.getRandomValues(new Uint8Array(12)); //96-bits

  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',

    kek as BufferSource,
    'AES-GCM',
    false,
    ['encrypt'],
  );

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: ivBytes,
      tagLength: 128,
    },
    cryptoKey,
    dekBytes,
  );

  const result = new Uint8Array(encryptedBuffer);
  const TAG_BYTE_LENGTH = 16;

  return {
    protectedDEK: {
      ciphertext: result.slice(0, result.length - TAG_BYTE_LENGTH),
      iv: ivBytes,
      authTag: result.slice(result.length - TAG_BYTE_LENGTH),
    },
    argon2Params: {
      memoryCost: ENCRYPTION_CONFIG.argon2.memoryCost,
      timeCost: ENCRYPTION_CONFIG.argon2.timeCost,
      parallelism: ENCRYPTION_CONFIG.argon2.parallelism,
      hashLength: ENCRYPTION_CONFIG.argon2.hashLength,
      type: ENCRYPTION_CONFIG.argon2.type,
    },
    schemaVersion: ENCRYPTION_CONFIG.schemaVersion,
    rawDEK: dekBytes,
  };
};
