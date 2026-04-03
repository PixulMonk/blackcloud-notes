export interface Argon2Params {
  memoryCost: number;
  timeCost: number;
  parallelism: number;
  hashLength: number;
  type: 'argon2id';
}

export interface ProtectedDEK {
  ciphertext: Uint8Array;
  iv: Uint8Array;
  authTag: Uint8Array;
}

export interface VaultInitializationResult {
  protectedDEK: ProtectedDEK;
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
  protectedDEK: ProtectedDEK;
  argon2Params: Argon2Params;
}

export interface LoginMetaDetaResponse {
  argon2Salt: string;
  protectedDEK: {
    ciphertext: string;
    iv: string;
    authTag: string;
  };
  argon2Params: Argon2Params;
}
