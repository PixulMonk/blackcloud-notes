import { ENCRYPTION_CONFIG } from '@blackcloud/shared';
import { type VaultInitializationResult } from '@/types/encryption.types';
import { encryptAESGCM } from './aes';

export const initializeUserVault = async (
  kek: Uint8Array,
): Promise<VaultInitializationResult> => {
  if (kek.length !== 32) {
    throw new Error('Invalid KEK length');
  }
  const dekBytes = window.crypto.getRandomValues(new Uint8Array(32)); //256-bits

  const protectedDEK = await encryptAESGCM(dekBytes, kek);

  return {
    protectedDEK,
    argon2Params: ENCRYPTION_CONFIG.argon2,
    schemaVersion: ENCRYPTION_CONFIG.schemaVersion,
    rawDEK: dekBytes,
  };
};
