// src/types/argon2-browser.d.ts
declare module 'argon2-browser' {
  export enum ArgonType {
    Argon2d = 0,
    Argon2i = 1,
    Argon2id = 2,
  }

  export interface HashOptions {
    pass: string; // password
    salt: string | Uint8Array; // salt can be string or Uint8Array
    time?: number; // iterations
    mem?: number; // memory in KiB
    hashLen?: number; // output length
    parallelism?: number; // parallelism factor
    secret?: Uint8Array; // optional secret data
    ad?: Uint8Array; // optional associated data
    type?: ArgonType; // Argon2 type
  }

  export interface HashResult {
    hash: Uint8Array;
    hashHex: string;
    encoded: string;
  }

  export interface VerifyOptions {
    pass: string;
    encoded: string;
    secret?: Uint8Array;
    ad?: Uint8Array;
    type?: ArgonType;
  }

  export function hash(options: HashOptions): Promise<HashResult>;
  export function verify(options: VerifyOptions): Promise<HashResult>;
}
