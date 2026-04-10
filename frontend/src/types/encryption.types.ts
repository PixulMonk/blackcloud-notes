import type { Argon2Params } from '@blackcloud/shared/src';

export interface VaultInitializationResult {
  protectedDEK: string;
  argon2Params: Argon2Params;
  schemaVersion: number;
  rawDEK: Uint8Array;
}

export interface DerivationResult {
  argon2Salt: Uint8Array;
  keyEncryptionKey: Uint8Array;
  authToken: Uint8Array;
  argon2Params: Argon2Params;
}

export interface LoginMetaData {
  argon2Salt: Uint8Array;
  protectedDEK: Uint8Array;
  argon2Params: Argon2Params;
}

export interface LoginMetaDetaResponse {
  success: boolean;
  argon2Salt: string; // base64
  argon2Params: Argon2Params;
  protectedDEK: string; // base64 — IV ‖ ciphertext ‖ tag
}
