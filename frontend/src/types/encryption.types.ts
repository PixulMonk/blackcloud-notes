import type {
  Argon2Params,
  EncryptedData,
  RawEncryptedData,
} from '@blackcloud/shared/src';

export interface VaultInitializationResult {
  protectedDEK: RawEncryptedData;
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
  protectedDEK: RawEncryptedData;
  argon2Params: Argon2Params;
}

export interface LoginMetaDetaResponse {
  argon2Salt: string;
  protectedDEK: EncryptedData;
  argon2Params: Argon2Params;
}
