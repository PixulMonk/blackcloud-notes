import { encryptAESGCM, decryptAESGCM } from './aes';

export const encryptString = async (value: string, key: Uint8Array) => {
  const plaintext = new TextEncoder().encode(value);
  return encryptAESGCM(plaintext, key);
};

export const decryptToString = async (
  payload: {
    ciphertext: Uint8Array;
    authTag: Uint8Array;
    iv: Uint8Array;
  },
  key: Uint8Array,
) => {
  const decrypted = await decryptAESGCM(
    payload.ciphertext,
    payload.authTag,
    key,
    payload.iv,
  );

  return new TextDecoder().decode(decrypted);
};
