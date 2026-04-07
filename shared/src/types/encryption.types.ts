export interface Argon2Params {
  memoryCost: number;
  timeCost: number;
  parallelism: number;
  hashLength: number;
  type: 'argon2id';
}

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  authTag: string;
}

export interface RawEncryptedData {
  ciphertext: Uint8Array;
  iv: Uint8Array;
  authTag: Uint8Array;
}
